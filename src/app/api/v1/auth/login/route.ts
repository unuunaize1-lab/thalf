import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';
import { authRateLimiter } from '@/lib/rate-limiter';
import { z } from 'zod';

const loginSchema = z.object({
  phone: z.string().min(1, 'Mobile number is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = await authRateLimiter.check(`login:${ip}`, 5, 900);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = loginSchema.parse(body);

    const { user, session } = await authService.loginUser({
      phone: validated.phone,
      password: validated.password,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role.name,
          phoneVerifiedAt: user.phoneVerifiedAt,
        },
      },
      { status: 200 }
    );

    // Set secure HTTP-only session cookie
    response.cookies.set('thalf_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: session.expiresAt,
      path: '/',
    });

    return response;
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production' && (error?.message?.includes('database server') || error?.name?.includes('PrismaClient'))) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed: Local PostgreSQL server is offline at 127.0.0.1:5432.' },
        { status: 503 }
      );
    }

    // Return exact generic message for all authentication failures in production
    return NextResponse.json(
      { success: false, error: 'Mobile number or password is incorrect.' },
      { status: 401 }
    );
  }
}
