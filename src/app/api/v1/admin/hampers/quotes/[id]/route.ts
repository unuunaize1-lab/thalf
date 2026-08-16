import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { hamperQuoteService } from '@/services/hamper-quote.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requirePermission(req, 'orders.read');
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const quote = await hamperQuoteService.getQuoteById(id);
    if (!quote) {
      return NextResponse.json({ success: false, error: 'Quote request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, quote });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requirePermission(req, 'orders.update');
  if (errorResponse || !session) return errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await hamperQuoteService.updateQuote(id, body, session.user.id);

    return NextResponse.json({ success: true, quote: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
