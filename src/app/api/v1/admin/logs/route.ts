import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { auditService } from '@/services/audit.service';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requirePermission(req, 'audit.read');
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const logs = await auditService.getLogs(limit, offset);
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
