import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({
    success: false,
    message: 'Online payment webhooks are disabled in Phase-1. THALF uses WhatsApp-assisted ordering.',
  }, { status: 400 });
}
