import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '@/services/settings.service';
import { requirePermission } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { auditService } from '@/services/audit.service';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requirePermission(req, 'settings.read');
  if (errorResponse) return errorResponse;

  try {
    const config = await settingsService.getWhatsAppConfig();
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requirePermission(req, 'settings.update');
  if (errorResponse || !session) return errorResponse;

  try {
    const body = await req.json();
    const actorId = session.user.id;

    const updated = await prisma.$transaction(async (tx) => {
      const result = await settingsService.updateWhatsAppConfig(body);

      await auditService.log(tx, {
        userId: actorId,
        action: 'UPDATE_SETTINGS_WHATSAPP',
        entity: 'Settings',
        details: { fieldsUpdated: Object.keys(body) },
      });

      return result;
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
