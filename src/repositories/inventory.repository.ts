import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class InventoryRepository {
  async findByProductId(productId: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return db.inventory.findUnique({
      where: { productId },
    });
  }

  /**
   * Atomically commits inventory reduction for confirmed orders.
   * Checks stock, prevents negative stock, and decrements stockQuantity.
   */
  async commitStock(productId: string, quantity: number, productName: string, tx: Prisma.TransactionClient) {
    const inventory = await tx.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new Error(`Inventory record not found for product "${productName}" (${productId})`);
    }

    if (inventory.stockQuantity < quantity) {
      throw new Error(
        `Insufficient stock for "${productName}". Required: ${quantity}, Available in inventory: ${inventory.stockQuantity}`
      );
    }

    return tx.inventory.update({
      where: { productId },
      data: {
        stockQuantity: { decrement: quantity },
      },
    });
  }

  async updateStockQuantity(productId: string, newQuantity: number) {
    return prisma.inventory.upsert({
      where: { productId },
      update: { stockQuantity: newQuantity },
      create: { productId, stockQuantity: newQuantity },
    });
  }

  /**
   * Controlled, transaction-safe inventory adjustment with InventoryLog recording
   */
  async adjustStock(
    productId: string,
    adjustment: number,
    reason: string,
    note?: string,
    actorId?: string,
    externalTx?: Prisma.TransactionClient
  ) {
    const executeAdjustment = async (tx: Prisma.TransactionClient) => {
      let inventory = await tx.inventory.findUnique({
        where: { productId },
      });

      if (!inventory) {
        inventory = await tx.inventory.create({
          data: { productId, stockQuantity: 0 },
        });
      }

      const previousQuantity = inventory.stockQuantity;
      const newQuantity = previousQuantity + adjustment;

      if (newQuantity < 0) {
        throw new Error(
          `Negative inventory violation: Current stock is ${previousQuantity}, adjustment of ${adjustment} would result in negative stock (${newQuantity}).`
        );
      }

      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: { stockQuantity: newQuantity },
      });

      const log = await tx.inventoryLog.create({
        data: {
          inventoryId: inventory.id,
          productId,
          previousQuantity,
          adjustment,
          newQuantity,
          reason,
          note: note || null,
          actorId: actorId || null,
        },
      });

      return { inventory: updatedInventory, log };
    };

    if (externalTx) {
      return executeAdjustment(externalTx);
    }

    return prisma.$transaction(async (tx) => executeAdjustment(tx));
  }

  async getHistory(params: { productId?: string; limit?: number; offset?: number }) {
    const { productId, limit = 50, offset = 0 } = params;
    const where: Prisma.InventoryLogWhereInput = productId ? { productId } : {};

    const [logs, total] = await Promise.all([
      prisma.inventoryLog.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inventoryLog.count({ where }),
    ]);

    return { logs, total, limit, offset };
  }
}

export const inventoryRepository = new InventoryRepository();
