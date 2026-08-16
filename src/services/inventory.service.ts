import { inventoryRepository } from '@/repositories/inventory.repository';
import { productRepository } from '@/repositories/product.repository';
import { auditService } from './audit.service';
import { prisma } from '@/lib/prisma';

export class InventoryService {
  async adjustInventory(params: {
    productId: string;
    adjustment: number;
    reason: string;
    note?: string;
    actorId: string;
  }) {
    const { productId, adjustment, reason, note, actorId } = params;

    if (!productId) {
      throw new Error('Product ID is required for inventory adjustment.');
    }
    if (typeof adjustment !== 'number' || isNaN(adjustment) || adjustment === 0) {
      throw new Error('Adjustment quantity must be a non-zero integer.');
    }
    if (!reason || reason.trim().length === 0) {
      throw new Error('Reason is required for inventory adjustment.');
    }

    const product = await productRepository.findById(productId);
    if (!product || product.isDeleted) {
      throw new Error(`Product '${productId}' not found or archived.`);
    }

    // Execute atomic transaction for inventory adjustment and ledger logging
    const result = await inventoryRepository.adjustStock(
      productId,
      adjustment,
      reason,
      note,
      actorId
    );

    // Record AuditLog
    await auditService.log(prisma, {
      userId: actorId,
      action: 'INVENTORY_ADJUSTED',
      entity: 'Inventory',
      entityId: result.inventory.id,
      details: {
        productId,
        productName: product.name,
        previousQuantity: result.log.previousQuantity,
        adjustment,
        newQuantity: result.log.newQuantity,
        reason,
        note,
      },
    });

    return result;
  }

  async getInventoryHistory(productId?: string, limit = 50, offset = 0) {
    return inventoryRepository.getHistory({ productId, limit, offset });
  }
}

export const inventoryService = new InventoryService();
