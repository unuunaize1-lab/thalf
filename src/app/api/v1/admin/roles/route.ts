import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { auditService } from '@/services/audit.service';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requirePermission(req, 'roles.read');
  if (errorResponse) return errorResponse;

  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: { select: { users: true } },
      },
    });

    return NextResponse.json({ success: true, roles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, errorResponse } = await requirePermission(req, 'roles.manage');
  if (errorResponse || !session) return errorResponse;

  try {
    const body = await req.json();
    const { roleId, permissions } = body;
    const actorId = session.user.id;

    if (!roleId || !Array.isArray(permissions)) {
      return NextResponse.json({ success: false, error: 'roleId and permissions array required' }, { status: 400 });
    }

    const updatedRole = await prisma.$transaction(async (tx) => {
      const updated = await tx.role.update({
        where: { id: roleId },
        data: { permissions },
      });

      await auditService.log(tx, {
        userId: actorId,
        action: 'UPDATE_ROLE_PERMISSIONS',
        entity: 'Role',
        entityId: roleId,
        details: { newPermissions: permissions },
      });

      return updated;
    });

    return NextResponse.json({ success: true, role: updatedRole });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
