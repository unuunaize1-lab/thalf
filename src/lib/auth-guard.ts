import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';
import { RoleType } from '@prisma/client';

export interface AuthenticatedSession {
  user: {
    id: string;
    email?: string | null;
    phone?: string | null;
    name?: string | null;
    isDeleted: boolean;
    role: {
      id: string;
      name: RoleType;
      permissions: string[];
    };
  };
}

/**
 * Validates session token from request cookies.
 * Performs live database checks on user account status (isDeleted) and current role permissions.
 * DENY-BY-DEFAULT: Returns null if session is invalid, expired, account deleted/disabled, or role missing.
 */
export async function getAuthenticatedSession(req: NextRequest): Promise<AuthenticatedSession | null> {
  const token = req.cookies.get('thalf_session')?.value;
  if (!token) return null;

  const session = await authService.getSession(token);
  if (!session || !session.user) return null;

  // Account Status Check: Reject deleted, disabled, or revoked user accounts
  if (session.user.isDeleted) {
    return null;
  }

  // Deny-by-default: Ensure user has a valid role assigned
  if (!session.user.role || !session.user.role.name) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      phone: session.user.phone,
      name: session.user.name,
      isDeleted: session.user.isDeleted,
      role: {
        id: session.user.role.id,
        name: session.user.role.name,
        permissions: session.user.role.permissions || [],
      },
    },
  };
}

/**
 * Server-Side Guard: Require Authenticated User (Any Valid Account)
 * Returns { session } or NextResponse error (401 Unauthorized)
 */
export async function requireSession(req: NextRequest): Promise<{ session?: AuthenticatedSession; errorResponse?: NextResponse }> {
  const session = await getAuthenticatedSession(req);
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Valid authentication session required' },
        { status: 401 }
      ),
    };
  }
  return { session };
}

/**
 * Server-Side Guard: Require specific Role(s)
 * Returns { session } or NextResponse error (401 / 403)
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: RoleType[]
): Promise<{ session?: AuthenticatedSession; errorResponse?: NextResponse }> {
  const session = await getAuthenticatedSession(req);
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (!allowedRoles.includes(session.user.role.name)) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient role privileges' },
        { status: 403 }
      ),
    };
  }

  return { session };
}

/**
 * Server-Side Guard: Require specific Granular Permission
 * DENY-BY-DEFAULT: Checks active permissions array for exact match or wildcard '*'
 * Returns { session } or NextResponse error (401 / 403)
 */
export async function requirePermission(
  req: NextRequest,
  requiredPermission: string
): Promise<{ session?: AuthenticatedSession; errorResponse?: NextResponse }> {
  const session = await getAuthenticatedSession(req);
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
    };
  }

  const permissions = session.user.role.permissions || [];
  const hasAccess = permissions.includes('*') || permissions.includes(requiredPermission);

  if (!hasAccess) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: `Forbidden: Missing required permission '${requiredPermission}'` },
        { status: 403 }
      ),
    };
  }

  return { session };
}
