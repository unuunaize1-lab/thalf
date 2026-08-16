import { hamperRepository, CreateHamperInput } from '@/repositories/hamper.repository';
import { auditService } from '@/services/audit.service';
import { prisma } from '@/lib/prisma';
import { HamperPricingMode } from '@prisma/client';

export class HamperService {
  async getHampers(params: {
    skip?: number;
    take?: number;
    hamperType?: string;
    pricingMode?: HamperPricingMode;
    status?: string;
    search?: string;
    isAdmin?: boolean;
  }) {
    return hamperRepository.findMany(params);
  }

  async getHamperById(id: string, isAdmin = false) {
    return hamperRepository.findById(id, isAdmin);
  }

  async getHamperBySlug(slug: string, isAdmin = false) {
    return hamperRepository.findBySlug(slug, isAdmin);
  }

  async createHamper(data: CreateHamperInput, actorId?: string) {
    const hamper = await hamperRepository.create(data);

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'CREATE_HAMPER',
        entity: 'Product',
        entityId: hamper.id,
        details: { name: hamper.name, pricingMode: hamper.pricingMode, hamperType: hamper.hamperType },
      });
    }

    return hamper;
  }

  async updateHamper(id: string, data: Partial<CreateHamperInput>, actorId?: string) {
    const hamper = await hamperRepository.update(id, data);

    if (actorId && hamper) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'UPDATE_HAMPER',
        entity: 'Product',
        entityId: id,
        details: { changes: Object.keys(data) },
      });
    }

    return hamper;
  }

  async deleteHamper(id: string, actorId?: string) {
    const deleted = await hamperRepository.delete(id);

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'DELETE_HAMPER',
        entity: 'Product',
        entityId: id,
      });
    }

    return deleted;
  }
}

export const hamperService = new HamperService();
