import { NextResponse } from 'next/server';
import { settingsService } from '@/services/settings.service';

export async function GET() {
  try {
    const config = await settingsService.getMarketingConfig();
    return NextResponse.json({ success: true, marketing: config });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
