import { NextResponse } from 'next/server';
import { collectionService } from '@/services/collection.service';

export async function GET() {
  try {
    const activeCollections = await collectionService.getActiveFestivalCollections();
    return NextResponse.json({
      success: true,
      collections: activeCollections,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
