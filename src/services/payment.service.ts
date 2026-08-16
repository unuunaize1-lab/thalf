import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@prisma/client';

export class PaymentService {
  async getPaymentByOrderId(orderId: string) {
    return prisma.payment.findUnique({
      where: { orderId },
    });
  }

  async markAsPaid(orderId: string, transactionRef?: string) {
    return prisma.payment.update({
      where: { orderId },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        transactionRef: transactionRef || `WA-PAY-${Date.now()}`,
      },
    });
  }

  async markAsRefunded(orderId: string, refundId?: string) {
    return prisma.payment.update({
      where: { orderId },
      data: {
        status: PaymentStatus.REFUNDED,
        refundId: refundId || `REF-${Date.now()}`,
      },
    });
  }
}

export const paymentService = new PaymentService();
