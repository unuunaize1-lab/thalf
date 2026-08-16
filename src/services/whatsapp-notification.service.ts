import { prisma } from '@/lib/prisma';

export interface SendNotificationOptions {
  force?: boolean;
}

export class WhatsAppNotificationService {
  /**
   * Cleans phone number to standard format digits only for Meta WhatsApp API
   * e.g. "+91 90611 07915" -> "919061107915"
   */
  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Constructs the server-authoritative message payload for THALF Admin
   */
  public buildOrderMessage(order: any): string {
    const itemsList = (order.orderItems || [])
      .map((item: any) => `${item.productName || item.product?.name || 'Item'} × ${item.quantity}`)
      .join('\n');

    const paymentStatusText = order.payment?.status === 'COMPLETED'
      ? 'PAID'
      : order.payment?.status === 'PENDING'
      ? 'UNPAID'
      : order.status === 'CONFIRMED'
      ? 'CONFIRMED'
      : 'UNPAID';

    const deliveryAddress = [
      order.street,
      order.city,
      order.state,
      order.postalCode,
      order.country || 'India',
    ].filter(Boolean).join(', ');

    const subtotalFormatted = Number(order.subtotal || 0).toLocaleString('en-IN');
    const shippingFormatted = Number(order.shippingAmount || 0).toLocaleString('en-IN');
    const totalFormatted = Number(order.totalAmount || 0).toLocaleString('en-IN');

    return [
      '🍫 NEW THALF ORDER',
      '',
      `Order: ${order.orderNumber}`,
      '',
      'Customer:',
      `${order.customerName}`,
      '',
      'Mobile:',
      `${order.customerPhone}`,
      '',
      'Items:',
      itemsList || 'No items listed',
      '',
      `Subtotal: ₹${subtotalFormatted}`,
      `Shipping: ₹${shippingFormatted}`,
      `Total: ₹${totalFormatted}`,
      '',
      'Payment:',
      paymentStatusText,
      '',
      'Delivery:',
      deliveryAddress,
      '',
      'Please check the Admin Panel for the complete order.',
    ].join('\n');
  }

  /**
   * Sends automatic WhatsApp notification to THALF admin number via Meta WhatsApp Cloud API
   * 100% Server-Authoritative: Fetches order details directly from PostgreSQL DB.
   * Resilient: Failure to send does NOT rollback or interrupt order creation.
   */
  async sendOrderNotification(orderId: string, options?: SendNotificationOptions) {
    try {
      // 1. Fetch server-authoritative order from PostgreSQL DB
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            include: {
              product: { select: { name: true } },
            },
          },
          payment: true,
        },
      });

      if (!order) {
        console.error(`[WhatsAppNotificationService] Order not found: ${orderId}`);
        return { success: false, error: 'Order not found' };
      }

      // 2. Duplicate Protection: One order = One notification
      if (order.whatsappNotificationStatus === 'SENT' && !options?.force) {
        return {
          success: true,
          skipped: true,
          message: `Order ${order.orderNumber} already notified on WhatsApp at ${order.whatsappNotifiedAt}`,
        };
      }

      // 3. Read environment configuration for Meta WhatsApp Cloud API
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const adminRecipientRaw = process.env.WHATSAPP_ADMIN_RECIPIENT || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919061107915';

      if (!accessToken || !phoneNumberId) {
        const errorMsg = 'Meta WhatsApp Cloud API credentials missing (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID)';
        console.warn(`[WhatsAppNotificationService] ${errorMsg} for order ${order.orderNumber}`);

        await prisma.order.update({
          where: { id: orderId },
          data: {
            whatsappNotificationStatus: 'FAILED',
            whatsappErrorMessage: errorMsg,
          },
        });

        return { success: false, error: errorMsg };
      }

      const adminRecipient = this.formatPhoneNumber(adminRecipientRaw);
      const messageBody = this.buildOrderMessage(order);

      // 4. Send Meta WhatsApp Cloud API HTTP POST Request
      const endpointUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: adminRecipient,
          type: 'text',
          text: {
            preview_url: false,
            body: messageBody,
          },
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMsg = responseData?.error?.message || `Meta WhatsApp API error status ${response.status}`;
        console.error(`[WhatsAppNotificationService] Failed to send notification for order ${order.orderNumber}:`, errorMsg);

        await prisma.order.update({
          where: { id: orderId },
          data: {
            whatsappNotificationStatus: 'FAILED',
            whatsappErrorMessage: errorMsg,
          },
        });

        return { success: false, error: errorMsg };
      }

      // 5. Update Order record on Success
      await prisma.order.update({
        where: { id: orderId },
        data: {
          whatsappNotificationStatus: 'SENT',
          whatsappNotifiedAt: new Date(),
          whatsappErrorMessage: null,
        },
      });

      return {
        success: true,
        messageId: responseData?.messages?.[0]?.id,
      };
    } catch (err: any) {
      console.error(`[WhatsAppNotificationService] Exception sending notification for order ${orderId}:`, err);

      try {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            whatsappNotificationStatus: 'FAILED',
            whatsappErrorMessage: err.message || 'Unknown network error',
          },
        });
      } catch (dbErr) {
        console.error('[WhatsAppNotificationService] Could not update failed status in DB:', dbErr);
      }

      return { success: false, error: err.message || 'Network exception' };
    }
  }
}

export const whatsappNotificationService = new WhatsAppNotificationService();
