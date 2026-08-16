import { NextRequest, NextResponse } from 'next/server';
import { hamperService } from '@/services/hamper.service';
import { HamperPricingMode } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hamperType = searchParams.get('hamperType') || undefined;
    const pricingMode = (searchParams.get('pricingMode') as HamperPricingMode) || undefined;
    const search = searchParams.get('search') || undefined;

    const hampers = await hamperService.getHampers({
      hamperType,
      pricingMode,
      status: 'ACTIVE',
      search,
      isAdmin: false, // Ensures internal cost components & margins are sanitized!
    });

    return NextResponse.json({ success: true, hampers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
