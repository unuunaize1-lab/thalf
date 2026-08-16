import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { hamperService } from '@/services/hamper.service';
import { HamperPricingMode } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requirePermission(req, 'products.read');
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const hamperType = searchParams.get('hamperType') || undefined;
    const pricingMode = (searchParams.get('pricingMode') as HamperPricingMode) || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const hampers = await hamperService.getHampers({
      hamperType,
      pricingMode,
      status,
      search,
      isAdmin: true,
    });

    return NextResponse.json({ success: true, hampers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requirePermission(req, 'products.create');
  if (errorResponse || !session) return errorResponse;

  try {
    const body = await req.json();
    const hamper = await hamperService.createHamper(body, session.user.id);

    return NextResponse.json({ success: true, hamper }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
