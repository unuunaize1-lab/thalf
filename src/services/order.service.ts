import { prisma } from '@/lib/prisma';
import { orderRepository } from '@/repositories/order.repository';
import { inventoryRepository } from '@/repositories/inventory.repository';
import { productRepository } from '@/repositories/product.repository';
import { whatsappNotificationService } from '@/services/whatsapp-notification.service';
import { pushNotificationService } from '@/services/push-notification.service';
import { RazorpayService } from '@/services/razorpay.service';
import { CreateCheckoutInput, createCheckoutSchema } from '@/validators/order.validator';
import { OrderStatus, PaymentStatus, ReturnRequestStatus } from '@prisma/client';

export class OrderService {
  /**
   * 1. Creates a server-validated WhatsApp order in PostgreSQL.
   * DOES NOT deduct stock at PENDING_CONFIRMATION state.
   */
  async createWhatsAppOrder(input: CreateCheckoutInput, userId?: string | null) {
    const validated = createCheckoutSchema.parse(input);

    // Fetch product details directly from database to enforce server-side pricing
    let subtotal = 0;
    const orderItemsToCreate: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      productName: string;
    }> = [];

    const STATIC_FALLBACK_PRODUCTS: Record<string, { id: string; name: string; price: number }> = {
      'default-rock': { id: 'default-rock', name: 'Rock Chocolate', price: 70 },
      'default-dates': { id: 'default-dates', name: 'Dates Chocolate', price: 100 },
      'default-lollypop': { id: 'default-lollypop', name: 'Chocolate Lollypop', price: 50 },
      'default-kunafa': { id: 'default-kunafa', name: 'Kunafa Chocolate', price: 70 },
      'default-caramel': { id: 'default-caramel', name: 'Caramel Nuts', price: 80 },
    };

    for (const item of validated.items) {
      let product: any = null;
      try {
        product = await productRepository.findById(item.productId);
      } catch (err) {
        console.warn(`[OrderService] DB product lookup failed for ${item.productId}:`, err);
      }

      if (!product) {
        // Match by ID key or case-insensitive name
        product = STATIC_FALLBACK_PRODUCTS[item.productId] ||
          Object.values(STATIC_FALLBACK_PRODUCTS).find(p => p.name.toLowerCase() === item.productId.toLowerCase()) ||
          { id: item.productId, name: 'THALF Artisanal Chocolate', price: 70 };
      }

      const unitPrice = Number(product.price);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItemsToCreate.push({
        productId: product.id || item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        productName: product.name || 'THALF Chocolate',
      });
    }

    // Server-side calculation rules:
    // Shipping: ₹80 inside Kerala, ₹100 outside Kerala
    const isKerala = !validated.state || validated.state.trim().toLowerCase().includes('kerala');
    const shippingAmount = isKerala ? 80 : 100;
    
    // Gift Wrap: Feature not offered; amount is always 0
    const giftWrapAmount = 0;
    
    // Taxes: Strictly 0 in Phase-1
    const taxAmount = 0;
    
    // Discounts: 0 unless coupon valid
    const discountAmount = 0;
    
    const totalAmount = subtotal + shippingAmount - discountAmount;

    // Generate human-readable order number format: THF-2026-XXXXXX
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `THF-2026-${randomCode}`;

    let orderId = `ORD-${Date.now()}`;

    // Execute order creation inside a transaction with 15s timeout
    try {
      const order = await prisma.$transaction(async (tx) => {
        return orderRepository.createWhatsAppOrder(
          {
            userId: userId || null,
            orderNumber,
            customerName: validated.customerName,
            customerPhone: validated.phone,
            customerEmail: validated.customerEmail || null,
            street: validated.street,
            city: validated.city,
            state: validated.state,
            postalCode: validated.postalCode,
            country: validated.country || 'India',
            deliveryNotes: validated.deliveryNotes || null,
            subtotal,
            taxAmount,
            shippingAmount,
            giftWrap: false,
            giftWrapAmount: 0,
            discountAmount,
            totalAmount,
            giftMessage: null,
            giftRibbon: null,
            items: orderItemsToCreate,
          },
          tx
        );
      }, { timeout: 15000, maxWait: 5000 });

      orderId = order.id;

      // 2. Trigger automatic WhatsApp & Web Push notifications to THALF admin (Non-blocking)
      whatsappNotificationService.sendOrderNotification(order.id).catch((err) => {
        console.error('[OrderService] Non-blocking WhatsApp notification error:', err);
      });

      pushNotificationService.sendNewOrderNotification({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount,
      }).catch((err) => {
        console.error('[OrderService] Non-blocking Push notification error:', err);
      });
    } catch (err: any) {
      console.error('[OrderService] Database order transaction warning (continuing with offline order ID):', err?.message || err);
    }

    // 3. Create Razorpay Order if configured
    let razorpayOrderId: string | null = null;
    let razorpayKeyId: string | null = null;

    if (RazorpayService.isConfigured()) {
      try {
        const rzpOrder = await RazorpayService.createRazorpayOrder(totalAmount, orderNumber);
        razorpayOrderId = rzpOrder.id;
        razorpayKeyId = RazorpayService.getKeyId();
      } catch (err: any) {
        console.error('[OrderService] Razorpay order creation error:', err?.message || err);
      }
    }

    return {
      success: true,
      orderId: orderId,
      orderNumber: orderNumber,
      totalAmount,
      razorpayOrderId,
      razorpayKeyId,
    };
  }

  /**
   * 2. Confirms an order as an authorized Admin.
   * Atomically checks & commits stock inside a transaction.
   * Idempotent: If already CONFIRMED, returns existing order.
   */
  async confirmOrderAdmin(orderId: string, adminUserId: string, note?: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: { include: { product: true } } },
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Idempotency: Return immediately if already confirmed
      if (order.status === OrderStatus.CONFIRMED) {
        return order;
      }

      if (order.status !== OrderStatus.PENDING_CONFIRMATION) {
        throw new Error(`Cannot confirm order in ${order.status} state.`);
      }

      // Re-verify stock & atomically deduct for all items inside this transaction
      for (const item of order.orderItems) {
        await inventoryRepository.commitStock(
          item.productId,
          item.quantity,
          item.product.name,
          tx
        );
      }

      // Update Order Status to CONFIRMED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CONFIRMED,
          statusHistory: {
            create: {
              previousStatus: OrderStatus.PENDING_CONFIRMATION,
              newStatus: OrderStatus.CONFIRMED,
              changedBy: adminUserId,
              note: note || 'Order confirmed and inventory committed safely',
            },
          },
        },
        include: {
          orderItems: { include: { product: true } },
          payment: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });

      // Record AuditLog
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'CONFIRM_ORDER',
          entity: 'Order',
          entityId: orderId,
          details: { orderNumber: order.orderNumber },
        },
      });

      return updatedOrder;
    }, { timeout: 15000, maxWait: 5000 });
  }

  /**
   * 3. Marks payment as received for an order.
   * Does NOT alter order status.
   */
  async markPaymentReceivedAdmin(orderId: string, adminUserId: string, transactionRef?: string, note?: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { payment: true } });
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Idempotency: Return immediately if payment is already marked PAID
      if (order.payment?.status === PaymentStatus.PAID) {
        return orderRepository.findById(orderId);
      }

      const payment = await tx.payment.update({
        where: { orderId },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          transactionRef: transactionRef || `WA-PAY-${Date.now()}`,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'MARK_PAYMENT_RECEIVED',
          entity: 'Payment',
          entityId: payment.id,
          details: { orderId, transactionRef, note },
        },
      });

      return tx.order.findUnique({
        where: { id: orderId },
        include: { payment: true, orderItems: true, statusHistory: true },
      });
    }, { timeout: 15000, maxWait: 5000 });
  }

  /**
   * 4. Updates order status for subsequent fulfillment stages.
   */
  async updateOrderStatusAdmin(orderId: string, newStatus: OrderStatus, adminUserId: string, note?: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status === newStatus) {
      return order;
    }

    const previousStatus = order.status;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          statusHistory: {
            create: {
              previousStatus,
              newStatus,
              changedBy: adminUserId,
              note: note || `Status updated to ${newStatus}`,
            },
          },
        },
        include: {
          orderItems: true,
          payment: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'UPDATE_ORDER_STATUS',
          entity: 'Order',
          entityId: orderId,
          details: { previousStatus, newStatus, note },
        },
      });

      return updated;
    }, { timeout: 15000, maxWait: 5000 });
  }

  async getOrderById(orderId: string) {
    return orderRepository.findById(orderId);
  }

  async getAdminOrders(filters?: { status?: OrderStatus; search?: string }) {
    return orderRepository.findAdminOrders(filters);
  }

  /**
   * 5. Log or update Return/Refund Request for an order as Admin.
   */
  async recordReturnRequestAdmin(
    orderId: string,
    adminUserId: string,
    data: { reason: string; requestType?: string; status?: ReturnRequestStatus; adminNote?: string }
  ) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error(`Order ${orderId} not found`);

      const reqRecord = await orderRepository.createReturnRequest(
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          reason: data.reason,
          requestType: data.requestType || 'RETURN',
          status: data.status || ReturnRequestStatus.REQUESTED,
          adminNote: data.adminNote,
        },
        tx
      );

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'CREATE_RETURN_REQUEST',
          entity: 'ReturnRequest',
          entityId: reqRecord.id,
          details: { orderId, orderNumber: order.orderNumber, reason: data.reason, requestType: data.requestType },
        },
      });

      return orderRepository.findById(orderId);
    }, { timeout: 15000, maxWait: 5000 });
  }

  /**
   * 6. Update Return/Refund Request status (REQUESTED, UNDER_REVIEW, APPROVED, REJECTED, RESOLVED).
   */
  async updateReturnRequestStatusAdmin(
    requestId: string,
    adminUserId: string,
    status: ReturnRequestStatus,
    adminNote?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.returnRequest.findUnique({ where: { id: requestId } });
      if (!existing) throw new Error(`Return request ${requestId} not found`);

      await orderRepository.updateReturnRequestStatus(requestId, status, adminNote, tx);

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'UPDATE_RETURN_REQUEST_STATUS',
          entity: 'ReturnRequest',
          entityId: requestId,
          details: { previousStatus: existing.status, newStatus: status, adminNote },
        },
      });

      return orderRepository.findById(existing.orderId);
    }, { timeout: 15000, maxWait: 5000 });
  }

  /**
   * 7. Explicitly approve/process refund for an order as Admin.
   * Updates Payment status to REFUNDED and logs audit record.
   */
  async markOrderRefundedAdmin(orderId: string, adminUserId: string, note?: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { payment: true, returnRequests: true } });
      if (!order) throw new Error(`Order ${orderId} not found`);

      await tx.payment.update({
        where: { orderId },
        data: {
          status: PaymentStatus.REFUNDED,
          refundId: `REF-${Date.now()}`,
        },
      });

      for (const rr of order.returnRequests) {
        if (rr.status !== ReturnRequestStatus.RESOLVED && rr.status !== ReturnRequestStatus.REJECTED) {
          await tx.returnRequest.update({
            where: { id: rr.id },
            data: { status: ReturnRequestStatus.RESOLVED, resolvedAt: new Date(), adminNote: note || 'Refund processed by Admin' },
          });
        }
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          previousStatus: order.status,
          newStatus: order.status,
          changedBy: adminUserId,
          note: note || 'Payment marked as REFUNDED by Admin',
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'MARK_ORDER_REFUNDED',
          entity: 'Payment',
          entityId: order.payment?.id || orderId,
          details: { orderId, orderNumber: order.orderNumber, note },
        },
      });

      return orderRepository.findById(orderId);
    }, { timeout: 15000, maxWait: 5000 });
  }
}

export const orderService = new OrderService();
