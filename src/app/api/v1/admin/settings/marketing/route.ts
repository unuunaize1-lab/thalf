import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { settingsService } from '@/services/settings.service';
import { auditService } from '@/services/audit.service';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requirePermission(req, 'settings.read');
  if (errorResponse) return errorResponse;

  try {
    const config = await settingsService.getMarketingConfig();
    return NextResponse.json({ success: true, marketing: config });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, errorResponse } = await requirePermission(req, 'settings.update');
  if (errorResponse || !session) return errorResponse;

  try {
    const body = await req.json();
    const updated = await settingsService.updateMarketingConfig(body);

    await auditService.log(prisma, {
      userId: session.user.id,
      action: 'UPDATE_SETTINGS_MARKETING',
      entity: 'Settings',
      details: body,
    });

    return NextResponse.json({ success: true, marketing: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
