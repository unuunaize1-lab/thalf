import { categoryRepository } from '@/repositories/category.repository';
import { auditService } from './audit.service';
import { prisma } from '@/lib/prisma';

export class CategoryService {
  async getCategories() {
    return categoryRepository.findMany();
  }

  async getCategoryById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error(`Category with ID '${id}' not found.`);
    }
    return category;
  }

  async createCategory(data: { name: string; slug: string; description?: string }, actorId?: string) {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Category name is required (min 2 chars).');
    }
    if (!data.slug || data.slug.trim().length < 2) {
      throw new Error('Category slug is required (min 2 chars).');
    }

    const existingSlug = await categoryRepository.findBySlug(data.slug);
    if (existingSlug) {
      throw new Error(`Category slug '${data.slug}' already exists.`);
    }

    const category = await categoryRepository.create(data);

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'CREATE_CATEGORY',
        entity: 'Category',
        entityId: category.id,
        details: { name: category.name, slug: category.slug },
      });
    }

    return category;
  }

  async updateCategory(id: string, data: { name?: string; slug?: string; description?: string }, actorId?: string) {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new Error(`Category with ID '${id}' not found.`);
    }

    if (data.slug && data.slug !== existing.slug) {
      const duplicateSlug = await categoryRepository.findBySlug(data.slug);
      if (duplicateSlug && duplicateSlug.id !== id) {
        throw new Error(`Category slug '${data.slug}' already exists.`);
      }
    }

    const updated = await categoryRepository.update(id, data);

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'UPDATE_CATEGORY',
        entity: 'Category',
        entityId: id,
        details: { updatedFields: Object.keys(data) },
      });
    }

    return updated;
  }

  async deleteCategory(id: string, actorId?: string) {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new Error(`Category with ID '${id}' not found.`);
    }

    const deleted = await categoryRepository.delete(id);

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'DELETE_CATEGORY',
        entity: 'Category',
        entityId: id,
        details: { name: existing.name, slug: existing.slug },
      });
    }

    return deleted;
  }
}

export const categoryService = new CategoryService();
