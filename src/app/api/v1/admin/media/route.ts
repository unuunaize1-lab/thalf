import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { MediaService } from '@/services/media.service';

export async function GET(req: NextRequest) {
  try {
    const { session, errorResponse } = await requirePermission(req, 'products.read');
    if (errorResponse) return errorResponse;
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized session' }, { status: 401 });
    }

    const mediaList = await MediaService.getAllMedia();
    const formatted = mediaList.map((m) => ({
      id: m.id,
      filename: m.filename,
      url: m.url,
      mimeType: m.mimeType,
      size: m.size >= 1024 * 1024
        ? `${(m.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(m.size / 1024).toFixed(0)} KB`,
      createdAt: m.createdAt ? m.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    }));

    return NextResponse.json({ success: true, media: formatted });
  } catch (err: any) {
    console.error('[AdminMediaAPI] GET error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
