import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { MediaService } from '@/services/media.service';

export async function POST(req: NextRequest) {
  // 1. Authorize admin request
  const { session, errorResponse } = await requirePermission(req, 'products.update');
  if (errorResponse || !session) return errorResponse;

  try {
    const contentType = req.headers.get('content-type') || '';
    let productId = '';
    let altText = '';
    let fileName = 'upload.png';
    let mimeType = 'image/png';
    let buffer: Buffer;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      productId = (formData.get('productId') as string) || '';
      altText = (formData.get('altText') as string) || '';

      if (!file) {
        return NextResponse.json({ success: false, error: 'No image file provided in form data' }, { status: 400 });
      }

      fileName = file.name || 'upload.png';
      mimeType = file.type || 'image/png';
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      const body = await req.json();
      productId = body.productId;
      altText = body.altText;
      fileName = body.fileName || 'upload.png';
      mimeType = body.mimeType || 'image/png';

      if (body.base64) {
        const base64Data = body.base64.replace(/^data:image\/\w+;base64,/, '');
        buffer = Buffer.from(base64Data, 'base64');
      } else {
        return NextResponse.json({ success: false, error: 'Image binary or base64 payload required' }, { status: 400 });
      }
    }

    // 2. Perform upload & DB persistence
    const actorId = session.user.id;
    const result = await MediaService.uploadMediaAsset(
      buffer,
      fileName,
      mimeType,
      productId,
      actorId,
      altText
    );

    const createdRecord = result.productImage || {
      id: result.media.id,
      productId: productId || '',
      url: result.media.url,
      alt: altText || fileName,
      bytes: result.media.size,
      createdAt: result.media.createdAt,
    };

    return NextResponse.json({
      success: true,
      image: createdRecord,
      media: {
        id: result.media.id,
        filename: result.media.filename,
        url: result.media.url,
        mimeType: result.media.mimeType,
        size: result.media.size,
        createdAt: result.media.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
