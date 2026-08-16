import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PushNotificationService } from './push-notification.service';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    adminPushSubscription: {
      upsert: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock web-push
vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

describe('PushNotificationService', () => {
  let service: PushNotificationService;

  beforeEach(() => {
    service = new PushNotificationService();
    vi.clearAllMocks();
    process.env.VAPID_PUBLIC_KEY = 'test_public_key_123';
    process.env.VAPID_PRIVATE_KEY = 'test_private_key_456';
    process.env.VAPID_SUBJECT = 'mailto:test@thalf.com';
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'test_public_key_123';
  });

  const mockSubInput = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-1',
    keys: {
      p256dh: 'test_p256dh_key',
      auth: 'test_auth_key',
    },
  };

  it('1. Registers push subscription for authenticated user', async () => {
    vi.mocked(prisma.adminPushSubscription.upsert).mockResolvedValue({
      id: 'sub_123',
      userId: 'user_admin_1',
      endpoint: mockSubInput.endpoint,
      p256dh: mockSubInput.keys.p256dh,
      auth: mockSubInput.keys.auth,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: null,
      revokedAt: null,
    });

    const result = await service.registerSubscription('user_admin_1', mockSubInput);

    expect(result.userId).toBe('user_admin_1');
    expect(result.endpoint).toBe(mockSubInput.endpoint);
    expect(prisma.adminPushSubscription.upsert).toHaveBeenCalledWith({
      where: { endpoint: mockSubInput.endpoint },
      create: {
        userId: 'user_admin_1',
        endpoint: mockSubInput.endpoint,
        p256dh: mockSubInput.keys.p256dh,
        auth: mockSubInput.keys.auth,
        isActive: true,
      },
      update: {
        userId: 'user_admin_1',
        p256dh: mockSubInput.keys.p256dh,
        auth: mockSubInput.keys.auth,
        isActive: true,
        revokedAt: null,
      },
    });
  });

  it('2. VAPID private key is never exposed via getPublicKey', () => {
    const pubKey = service.getPublicKey();
    expect(pubKey).toBe('test_public_key_123');
    expect(pubKey).not.toContain('test_private_key_456');
  });

  it('3. Sends Web Push notifications to multiple active Admin subscriptions', async () => {
    const activeSubs = [
      { id: 'sub_1', endpoint: 'https://push.example.com/1', p256dh: 'k1', auth: 'a1' },
      { id: 'sub_2', endpoint: 'https://push.example.com/2', p256dh: 'k2', auth: 'a2' },
    ];

    vi.mocked(prisma.adminPushSubscription.findMany).mockResolvedValue(activeSubs as any);
    vi.mocked(webpush.sendNotification).mockResolvedValue({ statusCode: 201 } as any);

    const res = await service.sendNewOrderNotification({
      id: 'ord_999',
      orderNumber: 'THF-2026-999999',
      totalAmount: 1850,
    });

    expect(res.success).toBe(true);
    expect(res.sentCount).toBe(2);
    expect(webpush.setVapidDetails).toHaveBeenCalledWith(
      'mailto:test@thalf.com',
      'test_public_key_123',
      'test_private_key_456'
    );
    expect(webpush.sendNotification).toHaveBeenCalledTimes(2);

    const callPayload = JSON.parse(vi.mocked(webpush.sendNotification).mock.calls[0][1] as string);
    expect(callPayload.title).toBe('🍫 New THALF Order');
    expect(callPayload.body).toContain('THF-2026-999999');
    expect(callPayload.body).toContain('1,850');
    expect(callPayload.data.orderId).toBe('ord_999');
    expect(callPayload.data.url).toBe('/admin/orders/ord_999');
  });

  it('4. Revokes expired subscription automatically when push service returns 410 / 404', async () => {
    const expiredSub = [{ id: 'sub_exp', endpoint: 'https://push.example.com/expired', p256dh: 'k', auth: 'a' }];
    vi.mocked(prisma.adminPushSubscription.findMany).mockResolvedValue(expiredSub as any);
    
    const error410: any = new Error('Subscription expired');
    error410.statusCode = 410;
    vi.mocked(webpush.sendNotification).mockRejectedValue(error410);

    const res = await service.sendNewOrderNotification({
      id: 'ord_100',
      orderNumber: 'THF-100',
      totalAmount: 500,
    });

    expect(res.success).toBe(true);
    expect(res.failedCount).toBe(1);
    expect(prisma.adminPushSubscription.update).toHaveBeenCalledWith({
      where: { endpoint: 'https://push.example.com/expired' },
      data: {
        isActive: false,
        revokedAt: expect.any(Date),
      },
    });
  });

  it('5. Handles missing VAPID credentials gracefully without throwing exception', async () => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;

    const res = await service.sendNewOrderNotification({
      id: 'ord_101',
      orderNumber: 'THF-101',
      totalAmount: 1000,
    });

    expect(res.success).toBe(false);
    expect(res.reason).toContain('Push notifications are not configured');
    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });
});
