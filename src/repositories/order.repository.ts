import { prisma } from '@/lib/prisma';
import { Prisma, OrderStatus, PaymentStatus, PaymentProvider } from '@prisma/client';

export interface CreateOrderParams {
  userId?: string | null;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  deliveryNotes?: string | null;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  giftWrap: boolean;
  giftWrapAmount: number;
  discountAmount: number;
  totalAmount: number;
  giftMessage?: string | null;
  giftRibbon?: string | null;
  items: Array<{ productId: string; quantity: number; unitPrice: number; totalPrice: number }>;
}

export class OrderRepository {
  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { product: true } },
        payment: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        returnRequests: { orderBy: { createdAt: 'desc' } },
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: { include: { product: true } },
        payment: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        returnRequests: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async findAdminOrders(filters?: { status?: OrderStatus; search?: string }) {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      const q = filters.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
      ];
    }

    return prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: { include: { product: true } },
        payment: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        returnRequests: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async createWhatsAppOrder(params: CreateOrderParams, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    const { items, userId, ...orderData } = params;

    const order = await db.order.create({
      data: {
        ...orderData,
        userId: userId || null,
        status: OrderStatus.PENDING_CONFIRMATION,
        orderItems: {
          createMany: {
            data: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          },
        },
        payment: {
          create: {
            provider: PaymentProvider.WHATSAPP_ASSISTED,
            status: PaymentStatus.UNPAID,
            amount: params.totalAmount,
            currency: 'INR',
          },
        },
        statusHistory: {
          create: {
            previousStatus: null,
            newStatus: OrderStatus.PENDING_CONFIRMATION,
            changedBy: 'CUSTOMER',
            note: 'Order created via WhatsApp checkout',
          },
        },
      },
      include: {
        orderItems: { include: { product: true } },
        payment: true,
        statusHistory: true,
      },
    });

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    previousStatus: OrderStatus,
    newStatus: OrderStatus,
    changedBy: string,
    note?: string,
    tx?: Prisma.TransactionClient
  ) {
    const db = tx || prisma;

    const order = await db.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        statusHistory: {
          create: {
            previousStatus,
            newStatus,
            changedBy,
            note: note || `Status updated from ${previousStatus} to ${newStatus}`,
          },
        },
      },
      include: {
        orderItems: true,
        payment: true,
        statusHistory: true,
      },
    });

    return order;
  }

  async markPaymentReceived(
    orderId: string,
    adminId: string,
    transactionRef?: string,
    note?: string,
    tx?: Prisma.TransactionClient
  ) {
    const db = tx || prisma;

    await db.payment.update({
      where: { orderId },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        transactionRef: transactionRef || `WA-PAY-${Date.now()}`,
      },
    });

    await db.auditLog.create({
      data: {
        userId: adminId,
        action: 'MARK_PAYMENT_RECEIVED',
        entity: 'Payment',
        entityId: orderId,
        details: { transactionRef, note },
      },
    });

    return this.findById(idFromOrderId(orderId));
  }

  async createReturnRequest(
    data: {
      orderId: string;
      orderNumber: string;
      customerName: string;
      customerPhone: string;
      reason: string;
      requestType?: string;
      status?: any;
      adminNote?: string;
    },
    tx?: Prisma.TransactionClient
  ) {
    const db = tx || prisma;
    return db.returnRequest.create({
      data: {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        reason: data.reason,
        requestType: data.requestType || 'RETURN',
        status: data.status || 'REQUESTED',
        adminNote: data.adminNote || null,
      },
    });
  }

  async updateReturnRequestStatus(
    requestId: string,
    status: any,
    adminNote?: string,
    tx?: Prisma.TransactionClient
  ) {
    const db = tx || prisma;
    const isResolved = status === 'RESOLVED' || status === 'REJECTED' || status === 'APPROVED';
    return db.returnRequest.update({
      where: { id: requestId },
      data: {
        status,
        ...(adminNote ? { adminNote } : {}),
        ...(isResolved ? { resolvedAt: new Date() } : {}),
      },
    });
  }
}

function idFromOrderId(id: string) {
  return id;
}

export const orderRepository = new OrderRepository();
