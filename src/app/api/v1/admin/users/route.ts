import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-crypto';
import { auditService } from '@/services/audit.service';
import { RoleType } from '@prisma/client';

// GET: Fetch list of admin/staff users
export async function GET(req: NextRequest) {
  const { errorResponse } = await requirePermission(req, 'roles.read');
  if (errorResponse) return errorResponse;

  try {
    const adminUsers = await prisma.user.findMany({
      where: {
        isDeleted: false,
        role: {
          name: {
            in: [RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.CONCIERGE],
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, users: adminUsers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create a new admin user credential
export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requirePermission(req, 'settings.update');
  if (errorResponse || !session) return errorResponse;

  try {
    const body = await req.json();
    const { name, email, phone, password, roleType } = body;

    if (!phone || !password || !roleType) {
      return NextResponse.json(
        { success: false, error: 'Mobile number, password, and role are required.' },
        { status: 400 }
      );
    }

    // Sanitize phone number (+91 format)
    let sanitizedPhone = phone.replace(/\D/g, '');
    if (sanitizedPhone.length > 10 && sanitizedPhone.startsWith('91')) {
      sanitizedPhone = sanitizedPhone.substring(2);
    } else if (sanitizedPhone.length === 11 && sanitizedPhone.startsWith('0')) {
      sanitizedPhone = sanitizedPhone.substring(1);
    }

    if (sanitizedPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const formattedPhone = `+91${sanitizedPhone}`;

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { name: roleType as RoleType },
    });

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Invalid role specified.' },
        { status: 400 }
      );
    }

    // Check if phone or email already in use
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: formattedPhone },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this mobile number or email already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name || 'Admin Staff',
          email: email || null,
          phone: formattedPhone,
          passwordHash: hashedPassword,
          roleId: role.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          role: { select: { name: true } },
        },
      });

      await auditService.log(tx, {
        userId: session.user.id,
        action: 'CREATE_ADMIN_USER',
        entity: 'User',
        entityId: user.id,
        details: { phone: formattedPhone, role: roleType },
      });

      return user;
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Change credential (update password, role, name, or phone)
export async function PATCH(req: NextRequest) {
  const { session, errorResponse } = await requirePermission(req, 'settings.update');
  if (errorResponse || !session) return errorResponse;

  try {
    const body = await req.json();
    const { userId, password, roleType, name, phone, email } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!userToUpdate) {
      return NextResponse.json({ success: false, error: 'Admin user not found' }, { status: 404 });
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (email !== undefined) updateData.email = email || null;

    if (phone) {
      let sanitizedPhone = phone.replace(/\D/g, '');
      if (sanitizedPhone.length > 10 && sanitizedPhone.startsWith('91')) {
        sanitizedPhone = sanitizedPhone.substring(2);
      }
      if (sanitizedPhone.length === 10) {
        updateData.phone = `+91${sanitizedPhone}`;
      }
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
      }
      updateData.passwordHash = hashPassword(password);
    }

    if (roleType) {
      const role = await prisma.role.findUnique({
        where: { name: roleType as RoleType },
      });
      if (!role) {
        return NextResponse.json({ success: false, error: 'Invalid role specified' }, { status: 400 });
      }
      updateData.roleId = role.id;
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: { select: { name: true } },
        },
      });

      await auditService.log(tx, {
        userId: session.user.id,
        action: 'UPDATE_ADMIN_CREDENTIALS',
        entity: 'User',
        entityId: userId,
        details: {
          updatedFields: Object.keys(updateData).filter(k => k !== 'passwordHash'),
          passwordChanged: !!password,
        },
      });

      return user;
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
