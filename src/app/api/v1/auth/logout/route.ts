import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('thalf_session')?.value;
  if (token) {
    await authService.revokeSession(token);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  // Explicitly clear browser session cookie
  response.cookies.set('thalf_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
