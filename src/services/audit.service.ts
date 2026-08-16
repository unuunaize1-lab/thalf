import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface CreateAuditLogParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
}

// Sensitive fields that must NEVER be persisted in audit logs
const SENSITIVE_KEYS = new Set(['password', 'passwordhash', 'token', 'rawtoken', 'tokenhash', 'secret', 'authorization']);

function sanitizeAuditDetails(details?: Record<string, any>): Record<string, any> | undefined {
  if (!details || typeof details !== 'object') return undefined;

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(details)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeAuditDetails(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const auditService = {
  /**
   * Log an administrative action into the AuditLog table.
   * Can be executed within a transaction client (tx) to ensure atomic persistence.
   */
  async log(
    dbOrTx: PrismaClient | Prisma.TransactionClient,
    params: CreateAuditLogParams
  ) {
    const sanitizedDetails = sanitizeAuditDetails(params.details);

    return await dbOrTx.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: sanitizedDetails ? (sanitizedDetails as Prisma.InputJsonValue) : Prisma.JsonNull,
        ipAddress: params.ipAddress || null,
      },
    });
  },

  /**
   * Fetch audit logs for admin audit dashboard.
   */
  async getLogs(limit = 50, offset = 0) {
    return await prisma.auditLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: { select: { name: true } },
          },
        },
      },
    });
  },
};
