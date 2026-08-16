import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, generateSessionToken, hashSessionToken } from '@/lib/auth-crypto';
import { normalizePhoneNumber, isValidIndianMobile } from '@/lib/phone-utils';
import { RoleType } from '@prisma/client';

export class AuthService {
  /**
   * Register a new Customer account with Mobile Number + Password
   */
  async registerUser(data: { name: string; phone: string; password: string; email?: string }) {
    if (!data.phone || !data.phone.trim()) {
      throw new Error('Mobile number is required for customer registration.');
    }

    const normalizedPhone = normalizePhoneNumber(data.phone);
    if (!isValidIndianMobile(normalizedPhone)) {
      throw new Error('Please enter a valid 10-digit Indian mobile number.');
    }

    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    let customerRole = await prisma.role.findUnique({ where: { name: RoleType.CUSTOMER } });
    if (!customerRole) {
      customerRole = await prisma.role.create({
        data: { name: RoleType.CUSTOMER, permissions: ['read:profile', 'create:order'] },
      });
    }

    const hashedPassword = hashPassword(data.password);
    const cleanEmail = data.email && data.email.trim() !== '' ? data.email.trim().toLowerCase() : null;

    try {
      const user = await prisma.user.create({
        data: {
          name: data.name.trim(),
          phone: normalizedPhone,
          email: cleanEmail,
          passwordHash: hashedPassword,
          roleId: customerRole.id,
          phoneVerifiedAt: null, // Phone verification is unverified upon registration
        },
        include: { role: true },
      });

      const session = await this.createSession(user.id);
      return { user, session };
    } catch (error: any) {
      // Prisma P2002 Unique Constraint Violation
      if (error?.code === 'P2002') {
        const target = error?.meta?.target;
        if (Array.isArray(target) && target.includes('phone')) {
          throw new Error('An account with this mobile number already exists.');
        }
        if (Array.isArray(target) && target.includes('email')) {
          throw new Error('An account with this email address already exists.');
        }
        throw new Error('An account with this credential already exists.');
      }
      throw error;
    }
  }

  /**
   * Login with Mobile Number and Password
   */
  async loginUser(data: { phone: string; password: string }) {
    if (!data.phone || !data.password) {
      throw new Error('Mobile number or password is incorrect.');
    }

    const normalizedPhone = normalizePhoneNumber(data.phone);

    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      include: { role: true },
    });

    // Account Enumeration Prevention: Generic message for unknown phone OR wrong password
    if (!user || !user.passwordHash || user.isDeleted) {
      throw new Error('Mobile number or password is incorrect.');
    }

    const isValid = verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Mobile number or password is incorrect.');
    }

    const session = await this.createSession(user.id);
    return { user, session };
  }

  /**
   * Create database session record storing SHA-256 tokenHash (30 day expiration)
   * Returns raw token for client browser HTTP-only cookie.
   */
  async createSession(userId: string) {
    const rawToken = generateSessionToken();
    const tokenHash = hashSessionToken(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return { token: rawToken, expiresAt };
  }

  /**
   * Validate session token from HTTP-only cookie by hashing token and looking up tokenHash in DB
   */
  async getSession(token: string) {
    if (!token) return null;

    const tokenHash = hashSessionToken(token);

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: { role: true },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      return null;
    }

    return session;
  }

  /**
   * Terminate database session by hashing raw token and deleting record
   */
  async revokeSession(token: string) {
    if (!token) return;
    const tokenHash = hashSessionToken(token);
    await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => {});
  }
}

export const authService = new AuthService();
