import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guard';
import { pushNotificationService } from '@/services/push-notification.service';
import { RoleType } from '@prisma/client';

export async function GET(req: NextRequest) {
  // Security Guard: Only authenticated Admin users can obtain public VAPID key
  const { errorResponse } = await requireRole(req, [
    RoleType.ADMIN,
    RoleType.SUPER_ADMIN,
    RoleType.CONCIERGE,
  ]);

  if (errorResponse) {
    return errorResponse;
  }

  const publicKey = pushNotificationService.getPublicKey();
  const isConfigured = pushNotificationService.isConfigured();

  return NextResponse.json({
    success: true,
    isConfigured,
    publicKey,
  });
}
