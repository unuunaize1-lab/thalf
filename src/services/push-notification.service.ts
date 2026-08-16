import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

export class PushNotificationService {
  /**
   * Reads VAPID credentials safely from environment without exposing secrets
   */
  private getVapidConfig() {
    const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || 'mailto:admin@thalf.com';

    if (!publicKey || !privateKey) {
      return null;
    }

    return { publicKey, privateKey, subject };
  }

  /**
   * Returns true if server has VAPID credentials configured
   */
  public isConfigured(): boolean {
    return this.getVapidConfig() !== null;
  }

  /**
   * Public VAPID Key to expose safely to authenticated Admin client browsers
   */
  public getPublicKey(): string | null {
    return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || null;
  }

  /**
   * Registers/upserts a browser push subscription for an authenticated Admin
   */
  async registerSubscription(userId: string, subscription: PushSubscriptionInput) {
    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      throw new Error('Invalid PushSubscription payload');
    }

    // Upsert subscription tied to authenticated user ID
    const record = await prisma.adminPushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        isActive: true,
      },
      update: {
        userId, // Transfer to current authenticated admin session
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        isActive: true,
        revokedAt: null,
      },
    });

    return record;
  }

  /**
   * Marks subscription as revoked when browser push service returns 404/410
   */
  async revokeSubscription(endpoint: string) {
    try {
      await prisma.adminPushSubscription.update({
        where: { endpoint },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      });
    } catch (err) {
      console.warn(`[PushNotificationService] Failed to revoke subscription ${endpoint}:`, err);
    }
  }

  /**
   * Sends real-time Web Push notification to all active Admin browsers/PWAs.
   * 100% Non-Blocking & Transaction Safe: Never throws or breaks order creation.
   */
  async sendNewOrderNotification(order: { id: string; orderNumber: string; totalAmount: number | string }) {
    try {
      const vapid = this.getVapidConfig();

      if (!vapid) {
        console.warn('[PushNotificationService] VAPID credentials missing. Skipping Web Push notification.');
        return { success: false, reason: 'Push notifications are not configured.' };
      }

      // Configure web-push library with server VAPID details
      webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

      // Fetch all active Admin push subscriptions
      const subscriptions = await prisma.adminPushSubscription.findMany({
        where: {
          isActive: true,
          user: {
            isDeleted: false,
            role: {
              name: { in: ['ADMIN', 'SUPER_ADMIN', 'CONCIERGE'] },
            },
          },
        },
      });

      if (subscriptions.length === 0) {
        return { success: true, sentCount: 0, message: 'No active Admin subscriptions registered.' };
      }

      const totalFormatted = Number(order.totalAmount || 0).toLocaleString('en-IN');

      const payload = JSON.stringify({
        title: '🍫 New THALF Order',
        body: `Order #${order.orderNumber} · ₹${totalFormatted}`,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          notificationType: 'NEW_ORDER',
          url: `/admin/orders/${order.id}`,
        },
      });

      let sentCount = 0;
      let failedCount = 0;

      await Promise.allSettled(
        subscriptions.map(async (sub) => {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          try {
            await webpush.sendNotification(pushSubscription, payload);
            sentCount++;
            // Update last used timestamp
            prisma.adminPushSubscription.update({
              where: { id: sub.id },
              data: { lastUsedAt: new Date() },
            }).catch(() => {});
          } catch (err: unknown) {
            failedCount++;
            const webPushErr = err as { statusCode?: number; message?: string };
            // If subscription is expired or invalid (404 / 410), revoke it automatically
            if (webPushErr?.statusCode === 404 || webPushErr?.statusCode === 410) {
              console.log(`[PushNotificationService] Revoking expired subscription (${webPushErr.statusCode}): ${sub.endpoint}`);
              await this.revokeSubscription(sub.endpoint);
            } else {
              console.error(`[PushNotificationService] Push delivery error for ${sub.endpoint}:`, webPushErr?.message || err);
            }
          }
        })
      );

      return {
        success: true,
        sentCount,
        failedCount,
        totalSubscriptions: subscriptions.length,
      };
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[PushNotificationService] Exception in sendNewOrderNotification:', error);
      return { success: false, error: error.message || 'Push dispatch error' };
    }
  }
}

export const pushNotificationService = new PushNotificationService();
