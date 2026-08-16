import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';
import { isValidIndianMobile, normalizePhoneNumber } from '@/lib/phone-utils';
import { authRateLimiter } from '@/lib/rate-limiter';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().refine((val) => isValidIndianMobile(val), {
    message: 'Please enter a valid 10-digit Indian mobile number',
  }),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = await authRateLimiter.check(`reg:${ip}`, 5, 900);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = registerSchema.parse(body);

    const { user, session } = await authService.registerUser({
      name: validated.name,
      phone: validated.phone,
      password: validated.password,
      email: validated.email || undefined,
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
      { status: 201 }
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
