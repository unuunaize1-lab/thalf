import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services/order.service';
import { requirePermission } from '@/lib/auth-guard';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { errorResponse } = await requirePermission(req, 'orders.read');
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const order = await orderService.getOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, status, transactionRef, note } = body;

    let session;
    let errorResponse;

    if (action === 'CONFIRM') {
      ({ session, errorResponse } = await requirePermission(req, 'orders.confirm'));
      if (errorResponse || !session) return errorResponse;

      const adminId = session.user.id; // Derived EXCLUSIVELY from authenticated session
      const result = await orderService.confirmOrderAdmin(id, adminId, note);
      return NextResponse.json({ success: true, order: result });
    }

    if (action === 'MARK_PAID') {
      ({ session, errorResponse } = await requirePermission(req, 'payments.markPaid'));
      if (errorResponse || !session) return errorResponse;

      const adminId = session.user.id; // Derived EXCLUSIVELY from authenticated session
      const result = await orderService.markPaymentReceivedAdmin(id, adminId, transactionRef, note);
      return NextResponse.json({ success: true, order: result });
    }

    if (action === 'MARK_REFUNDED') {
      ({ session, errorResponse } = await requirePermission(req, 'orders.update'));
      if (errorResponse || !session) return errorResponse;

      const adminId = session.user.id;
      const result = await orderService.markOrderRefundedAdmin(id, adminId, note);
      return NextResponse.json({ success: true, order: result });
    }

    if (action === 'RECORD_RETURN_REQUEST') {
      ({ session, errorResponse } = await requirePermission(req, 'orders.update'));
      if (errorResponse || !session) return errorResponse;

      const adminId = session.user.id;
      const result = await orderService.recordReturnRequestAdmin(id, adminId, {
        reason: body.reason || 'Customer request',
        requestType: body.requestType,
        status: body.returnStatus,
        adminNote: body.adminNote,
      });
      return NextResponse.json({ success: true, order: result });
    }

    if (action === 'UPDATE_STATUS' && status) {
      ({ session, errorResponse } = await requirePermission(req, 'orders.update'));
      if (errorResponse || !session) return errorResponse;

      const adminId = session.user.id;
      const result = await orderService.updateOrderStatusAdmin(id, status, adminId, note);
      return NextResponse.json({ success: true, order: result });
    }

    if (action === 'UPDATE_RETURN_STATUS' && body.requestId && body.returnStatus) {
      ({ session, errorResponse } = await requirePermission(req, 'orders.update'));
      if (errorResponse || !session) return errorResponse;

      const adminId = session.user.id;
      const result = await orderService.updateReturnRequestStatusAdmin(
        body.requestId,
        adminId,
        body.returnStatus,
        body.adminNote
      );
      return NextResponse.json({ success: true, order: result });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid admin order action' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 400 }
    );
  }
}
