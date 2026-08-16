import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RazorpayService } from '@/services/razorpay.service';
import { inventoryRepository } from '@/repositories/inventory.repository';
import { whatsappNotificationService } from '@/services/whatsapp-notification.service';
import { pushNotificationService } from '@/services/push-notification.service';
import { PaymentProvider, PaymentStatus, OrderStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required Razorpay payment verification parameter.' },
        { status: 400 }
      );
    }

    // 1. Verify Razorpay HMAC signature
    const isValid = RazorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Razorpay payment signature verification failed.' },
        { status: 400 }
      );
    }

    // 2. Fetch order to confirm
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: true } }, payment: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    }

    // If already paid and confirmed, return success
    if (order.payment?.status === PaymentStatus.PAID && order.status === OrderStatus.CONFIRMED) {
      return NextResponse.json({ success: true, message: 'Payment already verified.', orderId });
    }

    // 3. Atomically update payment, order status, and inventory inside transaction
    await prisma.$transaction(async (tx) => {
      // Update Payment record
      await tx.payment.update({
        where: { orderId },
        data: {
          provider: PaymentProvider.RAZORPAY,
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          transactionRef: razorpay_payment_id,
        },
      });

      // Update Order Status to CONFIRMED
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CONFIRMED,
          statusHistory: {
            create: {
              previousStatus: order.status,
              newStatus: OrderStatus.CONFIRMED,
              changedBy: 'RAZORPAY_SYSTEM',
              note: `Online payment verified via Razorpay (${razorpay_payment_id})`,
            },
          },
        },
      });

      // Commit stock for each item
      for (const item of order.orderItems) {
        await inventoryRepository.commitStock(
          item.productId,
          item.quantity,
          item.product.name,
          tx
        );
      }
    }, { timeout: 15000, maxWait: 5000 });

    // 4. Trigger Non-blocking Admin Push & WhatsApp notifications
    whatsappNotificationService.sendOrderNotification(order.id).catch((err) => {
      console.error('[PaymentVerify] WhatsApp notification error:', err);
    });

    pushNotificationService.sendNewOrderNotification({
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: Number(order.totalAmount),
    }).catch((err) => {
      console.error('[PaymentVerify] Push notification error:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Razorpay payment verified and order confirmed successfully.',
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error: any) {
    console.error('[PaymentVerify] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed.' },
      { status: 500 }
    );
  }
}
