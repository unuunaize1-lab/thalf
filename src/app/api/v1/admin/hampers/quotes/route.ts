import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { hamperQuoteService } from '@/services/hamper-quote.service';
import { QuoteRequestStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requirePermission(req, 'orders.read');
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') as QuoteRequestStatus | 'ALL') || 'ALL';
    const search = searchParams.get('search') || undefined;
    const hamperType = searchParams.get('hamperType') || undefined;

    const [data, analytics] = await Promise.all([
      hamperQuoteService.getQuoteRequests({ status, search, hamperType }),
      hamperQuoteService.getAnalytics(),
    ]);

    return NextResponse.json({
      success: true,
      requests: data.requests,
      total: data.total,
      analytics,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
