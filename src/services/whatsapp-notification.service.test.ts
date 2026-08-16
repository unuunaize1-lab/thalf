import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhatsAppNotificationService } from './whatsapp-notification.service';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock global fetch for Meta WhatsApp Cloud API
global.fetch = vi.fn();

describe('WhatsAppNotificationService', () => {
  let service: WhatsAppNotificationService;

  beforeEach(() => {
    service = new WhatsAppNotificationService();
    vi.clearAllMocks();
    process.env.WHATSAPP_ACCESS_TOKEN = 'test_access_token_123';
    process.env.WHATSAPP_PHONE_NUMBER_ID = 'test_phone_id_456';
    process.env.WHATSAPP_ADMIN_RECIPIENT = '+91 90611 07915';
  });

  const mockOrder = {
    id: 'ord_123',
    orderNumber: 'THF-2026-987654',
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 43210',
    street: '123 Marine Drive',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400002',
    country: 'India',
    subtotal: 1500,
    shippingAmount: 150,
    totalAmount: 1650,
    whatsappNotificationStatus: 'PENDING',
    whatsappNotifiedAt: null,
    whatsappErrorMessage: null,
    orderItems: [
      { productName: 'Dark Chocolate Truffles', quantity: 2 },
      { productName: 'Hazelnut Pralines', quantity: 1 },
    ],
    payment: { status: 'UNPAID' },
  };

  it('1. Constructs correct server-authoritative message body', () => {
    const message = service.buildOrderMessage(mockOrder);

    expect(message).toContain('🍫 NEW THALF ORDER');
    expect(message).toContain('Order: THF-2026-987654');
    expect(message).toContain('Aarav Sharma');
    expect(message).toContain('+91 98765 43210');
    expect(message).toContain('Dark Chocolate Truffles × 2');
    expect(message).toContain('Hazelnut Pralines × 1');
    expect(message).toContain('Subtotal: ₹1,500');
    expect(message).toContain('Shipping: ₹150');
    expect(message).toContain('Total: ₹1,650');
    expect(message).toContain('Payment:\nUNPAID');
    expect(message).toContain('123 Marine Drive, Mumbai, Maharashtra, 400002, India');
    expect(message).toContain('Please check the Admin Panel for the complete order.');
  });

  it('2. Successfully triggers Meta API & updates DB status on success', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [{ id: 'wamid_test_999' }] }),
    } as any);

    const result = await service.sendOrderNotification('ord_123');

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('wamid_test_999');

    // Verify Meta API endpoint and payload
    expect(global.fetch).toHaveBeenCalledWith(
      'https://graph.facebook.com/v21.0/test_phone_id_456/messages',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test_access_token_123',
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('THF-2026-987654'),
      })
    );

    // Verify DB update
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'ord_123' },
      data: expect.objectContaining({
        whatsappNotificationStatus: 'SENT',
        whatsappErrorMessage: null,
      }),
    });
  });

  it('3. Prevents duplicate notifications when already SENT', async () => {
    const sentOrder = { ...mockOrder, whatsappNotificationStatus: 'SENT', whatsappNotifiedAt: new Date() };
    vi.mocked(prisma.order.findUnique).mockResolvedValue(sentOrder as any);

    const result = await service.sendOrderNotification('ord_123');

    expect(result.success).toBe(true);
    expect(result.skipped).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('4. Handles WhatsApp failure gracefully without throwing exception', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid Access Token' } }),
    } as any);

    const result = await service.sendOrderNotification('ord_123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid Access Token');

    // Verify DB marked FAILED
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'ord_123' },
      data: expect.objectContaining({
        whatsappNotificationStatus: 'FAILED',
        whatsappErrorMessage: 'Invalid Access Token',
      }),
    });
  });

  it('5. Handles missing Meta credentials without throwing exception', async () => {
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);

    const result = await service.sendOrderNotification('ord_123');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Meta WhatsApp Cloud API credentials missing');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
