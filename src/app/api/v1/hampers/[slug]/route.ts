import { NextRequest, NextResponse } from 'next/server';
import { hamperService } from '@/services/hamper.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const hamper = await hamperService.getHamperBySlug(slug, false);
    if (!hamper) {
      return NextResponse.json({ success: false, error: 'Hamper not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, hamper });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
