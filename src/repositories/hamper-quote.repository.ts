import { prisma } from '@/lib/prisma';
import { QuoteRequestStatus, Prisma } from '@prisma/client';

export interface CreateQuoteRequestInput {
  name: string;
  phone: string;
  email?: string;
  hamperType: string;
  quantity: number;
  budget?: number;
  occasion?: string;
  deliveryDate?: Date;
  preferences?: string;
  personalization?: string;
  message?: string;
  productId?: string;
  customerId?: string;
}

export interface UpdateQuoteInput {
  quotedUnitPrice?: number;
  quotedQuantity?: number;
  additionalCharges?: number;
  discountAmount?: number;
  quotedAmount?: number;
  quoteValidUntil?: Date;
  adminNotes?: string;
  status?: QuoteRequestStatus;
  convertedOrderId?: string;
}

export class HamperQuoteRepository {
  /**
   * Helper to generate human-readable unique quote reference number
   */
  private generateQuoteNumber(): string {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return `HMP-${randomSuffix}`;
  }

  async create(data: CreateQuoteRequestInput) {
    let quoteNumber = this.generateQuoteNumber();

    // Check collision
    const existing = await prisma.hamperQuoteRequest.findUnique({ where: { quoteNumber } });
    if (existing) {
      quoteNumber = this.generateQuoteNumber();
    }

    const quote = await prisma.hamperQuoteRequest.create({
      data: {
        quoteNumber,
        name: data.name,
        phone: data.phone,
        email: data.email,
        hamperType: data.hamperType,
        quantity: data.quantity,
        budget: data.budget,
        occasion: data.occasion,
        deliveryDate: data.deliveryDate,
        preferences: data.preferences,
        personalization: data.personalization,
        message: data.message,
        productId: data.productId,
        customerId: data.customerId,
        status: QuoteRequestStatus.NEW,
      },
      include: {
        product: { select: { id: true, name: true, slug: true, startingPrice: true, pricingMode: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return quote;
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    status?: QuoteRequestStatus | 'ALL';
    search?: string;
    hamperType?: string;
  }) {
    const { skip = 0, take = 50, status, search, hamperType } = params;

    const where: Prisma.HamperQuoteRequestWhereInput = {
      ...(status && status !== 'ALL' ? { status } : {}),
      ...(hamperType && hamperType !== 'ALL' ? { hamperType } : {}),
      ...(search && {
        OR: [
          { quoteNumber: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { occasion: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [requests, total] = await Promise.all([
      prisma.hamperQuoteRequest.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, slug: true, startingPrice: true, images: { take: 1 } } },
          customer: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.hamperQuoteRequest.count({ where }),
    ]);

    return { requests, total };
  }

  async findById(id: string) {
    return prisma.hamperQuoteRequest.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            images: { take: 1 },
            pricingTiers: true,
          },
        },
        customer: true,
      },
    });
  }

  async update(id: string, data: UpdateQuoteInput) {
    return prisma.hamperQuoteRequest.update({
      where: { id },
      data,
      include: {
        product: true,
        customer: true,
      },
    });
  }

  async getAnalytics() {
    const [
      totalRequests,
      newRequests,
      pendingQuotes,
      quotedRequests,
      acceptedRequests,
      rejectedRequests,
      aggregateValue,
    ] = await Promise.all([
      prisma.hamperQuoteRequest.count(),
      prisma.hamperQuoteRequest.count({ where: { status: QuoteRequestStatus.NEW } }),
      prisma.hamperQuoteRequest.count({ where: { status: QuoteRequestStatus.REVIEWING } }),
      prisma.hamperQuoteRequest.count({ where: { status: QuoteRequestStatus.QUOTED } }),
      prisma.hamperQuoteRequest.count({ where: { status: QuoteRequestStatus.ACCEPTED } }),
      prisma.hamperQuoteRequest.count({ where: { status: QuoteRequestStatus.REJECTED } }),
      prisma.hamperQuoteRequest.aggregate({
        _sum: { quotedAmount: true },
        where: { status: { in: [QuoteRequestStatus.QUOTED, QuoteRequestStatus.ACCEPTED] } },
      }),
    ]);

    return {
      totalRequests,
      newRequests,
      pendingQuotes,
      quotedRequests,
      acceptedRequests,
      rejectedRequests,
      totalQuotedValue: aggregateValue._sum.quotedAmount ? Number(aggregateValue._sum.quotedAmount) : 0,
    };
  }
}

export const hamperQuoteRepository = new HamperQuoteRepository();
