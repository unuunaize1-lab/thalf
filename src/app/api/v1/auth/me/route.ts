import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('thalf_session')?.value;
    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const session = await authService.getSession(token);
    if (!session || !session.user || session.user.isDeleted) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        phone: session.user.phone,
        role: session.user.role.name,
        phoneVerifiedAt: session.user.phoneVerifiedAt,
      },
    });
  } catch (error) {
    console.error('API /auth/me Error:', error);
    return NextResponse.json({ success: false, user: null, error: 'Internal Server Error' }, { status: 500 });
  }
}
