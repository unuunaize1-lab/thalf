import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/services/order.service';
import { authService } from '@/services/auth.service';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check for verified server session token
    let sessionUserId: string | null = null;
    const token = req.cookies.get('thalf_session')?.value;
    if (token) {
      const session = await authService.getSession(token);
      if (session && session.user && !session.user.isDeleted) {
        sessionUserId = session.user.id;
      }
    }

    // Ignore client-supplied userId and pass verified server sessionUserId
    const result = await orderService.createWhatsAppOrder(body, sessionUserId);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process order',
      },
      { status: 400 }
    );
  }
}
