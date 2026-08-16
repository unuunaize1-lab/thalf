import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guard';
import { pushNotificationService } from '@/services/push-notification.service';
import { RoleType } from '@prisma/client';

export async function POST(req: NextRequest) {
  // Security Guard: Only authenticated Admin/SuperAdmin/Concierge users
  const { session, errorResponse } = await requireRole(req, [
    RoleType.ADMIN,
    RoleType.SUPER_ADMIN,
    RoleType.CONCIERGE,
  ]);

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await req.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, error: 'Invalid push subscription payload' },
        { status: 400 }
      );
    }

    // Derive userId strictly from session (never trust client-supplied userId)
    const record = await pushNotificationService.registerSubscription(
      session!.user.id,
      subscription
    );

    return NextResponse.json({
      success: true,
      message: 'Admin push subscription registered successfully',
      subscriptionId: record.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register push subscription' },
      { status: 500 }
    );
  }
}
