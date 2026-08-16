import {
  collectionRepository,
  CreateCollectionInput,
  UpdateCollectionInput,
} from '@/repositories/collection.repository';
import { auditService } from './audit.service';
import { prisma } from '@/lib/prisma';

export class CollectionService {
  async getCollections() {
    return collectionRepository.findMany();
  }

  async getActiveFestivalCollections() {
    return collectionRepository.findActiveFestivalCollections();
  }

  async getCollectionById(id: string) {
    const collection = await collectionRepository.findById(id);
    if (!collection) {
      throw new Error(`Collection with ID '${id}' not found.`);
    }
    return collection;
  }

  async getCollectionBySlug(slug: string) {
    const collection = await collectionRepository.findBySlug(slug);
    if (!collection) {
      throw new Error(`Collection with slug '${slug}' not found.`);
    }
    return collection;
  }

  async createCollection(data: CreateCollectionInput, actorId?: string) {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Collection name is required (min 2 chars).');
    }

    const slug = (data.slug || data.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!slug || slug.length < 2) {
      throw new Error('Collection slug is required (min 2 chars).');
    }

    const existingSlug = await collectionRepository.findBySlug(slug);
    if (existingSlug) {
      throw new Error(`Collection slug '${slug}' already exists.`);
    }

    const collection = await collectionRepository.create({
      ...data,
      slug,
    });

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'CREATE_COLLECTION',
        entity: 'Collection',
        entityId: collection.id,
        details: { name: collection.name, slug: collection.slug },
      });
    }

    return collection;
  }

  async updateCollection(id: string, data: UpdateCollectionInput, actorId?: string) {
    const existing = await collectionRepository.findById(id);
    if (!existing) {
      throw new Error(`Collection with ID '${id}' not found.`);
    }

    if (data.slug && data.slug !== existing.slug) {
      const duplicateSlug = await collectionRepository.findBySlug(data.slug);
      if (duplicateSlug && duplicateSlug.id !== id) {
        throw new Error(`Collection slug '${data.slug}' already exists.`);
      }
    }

    const updated = await collectionRepository.update(id, data);

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'UPDATE_COLLECTION',
        entity: 'Collection',
        entityId: id,
        details: { updatedFields: Object.keys(data) },
      });
    }

    return updated;
  }

  async deleteCollection(id: string, actorId?: string) {
    const existing = await collectionRepository.findById(id);
    if (!existing) {
      throw new Error(`Collection with ID '${id}' not found.`);
    }

    const deleted = await collectionRepository.delete(id);

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'DELETE_COLLECTION',
        entity: 'Collection',
        entityId: id,
        details: { name: existing.name, slug: existing.slug },
      });
    }

    return deleted;
  }
}

export const collectionService = new CollectionService();
