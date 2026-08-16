import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { hamperService } from '@/services/hamper.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requirePermission(req, 'products.read');
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const hamper = await hamperService.getHamperById(id, true);
    if (!hamper) {
      return NextResponse.json({ success: false, error: 'Hamper not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, hamper });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requirePermission(req, 'products.update');
  if (errorResponse || !session) return errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();
    const hamper = await hamperService.updateHamper(id, body, session.user.id);

    return NextResponse.json({ success: true, hamper });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requirePermission(req, 'products.archive');
  if (errorResponse || !session) return errorResponse;

  try {
    const { id } = await params;
    await hamperService.deleteHamper(id, session.user.id);

    return NextResponse.json({ success: true, message: 'Hamper deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
