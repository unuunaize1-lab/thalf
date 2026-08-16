import { NextResponse } from 'next/server';
import { settingsService } from '@/services/settings.service';

export async function GET() {
  try {
    const config = await settingsService.getWhatsAppConfig();
    return NextResponse.json({
      success: true,
      phoneNumber: config.phoneNumber,
      displayName: config.displayName,
      enabled: config.enabled,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      phoneNumber: '919876500000',
      displayName: 'THALF Artisanal Concierge',
      enabled: true,
    });
  }
}
