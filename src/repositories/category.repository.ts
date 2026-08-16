import { prisma } from '@/lib/prisma';

export class CategoryRepository {
  async findMany() {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: { where: { isDeleted: false } } },
        },
      },
    });

    return categories.map(cat => ({
      ...cat,
      productCount: cat._count.products,
    }));
  }

  async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: { where: { isDeleted: false } } },
        },
      },
    });
    if (!category) return null;
    return {
      ...category,
      productCount: category._count.products,
    };
  }

  async findBySlug(slug: string) {
    return prisma.category.findFirst({
      where: { slug: { equals: slug, mode: 'insensitive' } },
    });
  }

  async create(data: { name: string; slug: string; description?: string }) {
    return prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
      },
    });
  }

  async update(id: string, data: { name?: string; slug?: string; description?: string }) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    // Check if active (non-deleted) products are associated
    const activeCount = await prisma.product.count({
      where: { categoryId: id, isDeleted: false },
    });

    if (activeCount > 0) {
      throw new Error(`Cannot delete this category. ${activeCount} active product(s) are still assigned to it. Please reassign or remove the products first.`);
    }

    // Delete any soft-deleted products linked to this category to satisfy foreign key constraints
    await prisma.product.deleteMany({
      where: { categoryId: id, isDeleted: true },
    });

    return prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryRepository = new CategoryRepository();
