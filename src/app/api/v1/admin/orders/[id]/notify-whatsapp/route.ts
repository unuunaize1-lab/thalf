import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { whatsappNotificationService } from '@/services/whatsapp-notification.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requirePermission(req, 'orders.update');
  if (errorResponse) return errorResponse;

  try {
    const { id: orderId } = await params;
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const result = await whatsappNotificationService.sendOrderNotification(orderId, { force: true });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send WhatsApp notification' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp order notification sent successfully to THALF Admin',
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
