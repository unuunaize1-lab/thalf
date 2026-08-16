import { prisma } from '@/lib/prisma';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id, isDeleted: false },
      include: {
        role: true,
        addresses: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email, isDeleted: false },
      include: {
        role: true,
      },
    });
  }

  async createAddress(userId: string, data: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  }) {
    return prisma.address.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }
}

export const userRepository = new UserRepository();
