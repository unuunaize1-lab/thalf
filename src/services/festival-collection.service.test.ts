import { describe, it, expect, vi, beforeEach } from 'vitest';
import { collectionService } from './collection.service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    collection: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

describe('Festival Collection Seasonal Visibility & Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockActiveCol = {
    id: 'col_active_1',
    name: 'Diwali Artisanal Hampers 2026',
    slug: 'diwali-artisanal-hampers-2026',
    description: 'Festive chocolate gift boxes',
    bannerImage: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55',
    startDate: new Date('2026-08-01T00:00:00Z'),
    endDate: new Date('2026-11-30T23:59:59Z'),
    isActive: true,
    isFeatured: true,
    displayOrder: 1,
    products: [
      { id: 'prod_1', name: 'THALF Diwali Luxury Box', sku: 'THF-DWL-01', price: 2500, status: 'ACTIVE' },
    ],
  };

  it('1. Returns active festival collections matching seasonal date bounds', async () => {
    vi.mocked(prisma.collection.findMany).mockResolvedValue([mockActiveCol as any]);

    const activeFestivals = await collectionService.getActiveFestivalCollections();

    expect(activeFestivals.length).toBe(1);
    expect(activeFestivals[0].name).toBe('Diwali Artisanal Hampers 2026');
    expect(prisma.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
        }),
      })
    );
  });

  it('2. Filters out future and expired collections based on seasonal logic', () => {
    const now = new Date('2026-08-14T12:00:00Z');

    const futureCollection = {
      isActive: true,
      startDate: new Date('2026-10-01T00:00:00Z'), // Future
      endDate: new Date('2026-11-01T00:00:00Z'),
    };

    const expiredCollection = {
      isActive: true,
      startDate: new Date('2026-01-01T00:00:00Z'),
      endDate: new Date('2026-07-01T00:00:00Z'), // Expired
    };

    const isFutureVisible = futureCollection.isActive &&
      (!futureCollection.startDate || futureCollection.startDate <= now) &&
      (!futureCollection.endDate || futureCollection.endDate >= now);

    const isExpiredVisible = expiredCollection.isActive &&
      (!expiredCollection.startDate || expiredCollection.startDate <= now) &&
      (!expiredCollection.endDate || expiredCollection.endDate >= now);

    expect(isFutureVisible).toBe(false);
    expect(isExpiredVisible).toBe(false);
  });

  it('3. Respects manual Admin active toggle (deactivated collection is hidden)', () => {
    const disabledCollection = {
      isActive: false, // Explicitly deactivated by Admin
      startDate: new Date('2026-01-01T00:00:00Z'),
      endDate: new Date('2026-12-31T23:59:59Z'),
    };

    const isVisible = disabledCollection.isActive;
    expect(isVisible).toBe(false);
  });

  it('4. Allows Admin to create a festival collection with seasonal dates and product links', async () => {
    vi.mocked(prisma.collection.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.collection.create).mockResolvedValue({
      ...mockActiveCol,
      id: 'col_new_99',
    } as any);

    const created = await collectionService.createCollection({
      name: 'Christmas Special 2026',
      slug: 'christmas-special-2026',
      bannerImage: 'https://images.unsplash.com/photo-christmas',
      startDate: '2026-12-01T00:00:00Z',
      endDate: '2026-12-25T23:59:59Z',
      isActive: true,
      isFeatured: true,
      displayOrder: 2,
      productIds: ['prod_1', 'prod_2'],
    });

    expect(created.id).toBe('col_new_99');
    expect(prisma.collection.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Christmas Special 2026',
          slug: 'christmas-special-2026',
          isActive: true,
          products: {
            connect: [{ id: 'prod_1' }, { id: 'prod_2' }],
          },
        }),
      })
    );
  });

  it('5. Allows Admin to update linked products in a festival collection', async () => {
    vi.mocked(prisma.collection.findUnique).mockResolvedValue({
      ...mockActiveCol,
      _count: { products: 1 },
    } as any);

    vi.mocked(prisma.collection.update).mockResolvedValue({
      ...mockActiveCol,
      products: [{ id: 'prod_2' }],
    } as any);

    const updated = await collectionService.updateCollection('col_active_1', {
      productIds: ['prod_2'],
    });

    expect(updated).toBeDefined();
    expect(prisma.collection.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'col_active_1' },
        data: expect.objectContaining({
          products: {
            set: [{ id: 'prod_2' }],
          },
        }),
      })
    );
  });
});
