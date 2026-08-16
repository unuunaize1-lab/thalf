import {
  hamperQuoteRepository,
  CreateQuoteRequestInput,
  UpdateQuoteInput,
} from '@/repositories/hamper-quote.repository';
import { auditService } from '@/services/audit.service';
import { prisma } from '@/lib/prisma';
import { QuoteRequestStatus } from '@prisma/client';

export class HamperQuoteService {
  async submitQuoteRequest(data: CreateQuoteRequestInput, customerId?: string) {
    const input: CreateQuoteRequestInput = {
      ...data,
      customerId: customerId || data.customerId,
    };

    const quote = await hamperQuoteRepository.create(input);
    return quote;
  }

  async getQuoteRequests(params: {
    skip?: number;
    take?: number;
    status?: QuoteRequestStatus | 'ALL';
    search?: string;
    hamperType?: string;
  }) {
    return hamperQuoteRepository.findMany(params);
  }

  async getQuoteById(id: string) {
    return hamperQuoteRepository.findById(id);
  }

  async getAnalytics() {
    return hamperQuoteRepository.getAnalytics();
  }

  /**
   * Server-authoritative calculation of custom quotation:
   * Final Amount = (Unit Price * Quantity) + Additional Charges - Discount
   */
  calculateQuotedAmount(params: {
    unitPrice: number;
    quantity: number;
    additionalCharges?: number;
    discountAmount?: number;
  }) {
    const unitPrice = Math.max(0, params.unitPrice || 0);
    const quantity = Math.max(1, params.quantity || 1);
    const additionalCharges = Math.max(0, params.additionalCharges || 0);
    const discountAmount = Math.max(0, params.discountAmount || 0);

    const baseSubtotal = unitPrice * quantity;
    const finalAmount = Math.max(0, baseSubtotal + additionalCharges - discountAmount);

    return {
      unitPrice,
      quantity,
      baseSubtotal,
      additionalCharges,
      discountAmount,
      finalAmount,
    };
  }

  async updateQuote(id: string, data: UpdateQuoteInput, actorId?: string) {
    const existing = await hamperQuoteRepository.findById(id);
    if (!existing) {
      throw new Error('Quote request not found');
    }

    const finalData: UpdateQuoteInput = { ...data };

    // Server-authoritative recalculation if pricing components are updated
    if (data.quotedUnitPrice !== undefined || data.quotedQuantity !== undefined) {
      const unitPrice = data.quotedUnitPrice ?? Number(existing.quotedUnitPrice || 0);
      const quantity = data.quotedQuantity ?? existing.quantity ?? 1;
      const additionalCharges = data.additionalCharges ?? Number(existing.additionalCharges || 0);
      const discountAmount = data.discountAmount ?? Number(existing.discountAmount || 0);

      const calc = this.calculateQuotedAmount({
        unitPrice,
        quantity,
        additionalCharges,
        discountAmount,
      });

      finalData.quotedUnitPrice = calc.unitPrice;
      finalData.quotedQuantity = calc.quantity;
      finalData.additionalCharges = calc.additionalCharges;
      finalData.discountAmount = calc.discountAmount;
      finalData.quotedAmount = calc.finalAmount;

      // If updating pricing, set status to QUOTED if currently NEW or REVIEWING
      if (!data.status && (existing.status === QuoteRequestStatus.NEW || existing.status === QuoteRequestStatus.REVIEWING)) {
        finalData.status = QuoteRequestStatus.QUOTED;
      }
    }

    const updated = await hamperQuoteRepository.update(id, finalData);

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'UPDATE_HAMPER_QUOTE',
        entity: 'HamperQuoteRequest',
        entityId: id,
        details: { quoteNumber: existing.quoteNumber, status: updated.status, quotedAmount: updated.quotedAmount },
      });
    }

    return updated;
  }
}

export const hamperQuoteService = new HamperQuoteService();
