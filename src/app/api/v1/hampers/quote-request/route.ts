import { NextRequest, NextResponse } from 'next/server';
import { hamperQuoteService } from '@/services/hamper-quote.service';
import { getAuthenticatedSession } from '@/lib/auth-guard';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const body = await req.json();

    if (!body.name || !body.phone || !body.hamperType || !body.quantity) {
      return NextResponse.json(
        { success: false, error: 'Name, Phone, Hamper Type, and Quantity are required' },
        { status: 400 }
      );
    }

    const quote = await hamperQuoteService.submitQuoteRequest(
      {
        name: body.name,
        phone: body.phone,
        email: body.email,
        hamperType: body.hamperType,
        quantity: Number(body.quantity),
        budget: body.budget ? Number(body.budget) : undefined,
        occasion: body.occasion,
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : undefined,
        preferences: body.preferences,
        personalization: body.personalization,
        message: body.message,
        productId: body.productId,
      },
      session?.user?.id
    );

    return NextResponse.json({
      success: true,
      message: 'Quotation request submitted successfully',
      quoteNumber: quote.quoteNumber,
      id: quote.id,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
