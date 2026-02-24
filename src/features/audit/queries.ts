import 'server-only'

import { db } from '@/db'
import { auditLog, users } from '@/db/schema'
import { eq, and, sql, desc, gte, lte } from 'drizzle-orm'

// ─── getAuditLogEntries ─────────────────────────────────

interface AuditLogFilters {
  actorId?: string
  actionType?: string
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}

export async function getAuditLogEntries(filters: AuditLogFilters = {}) {
  const { actorId, actionType, startDate, endDate, page = 1, limit = 50 } = filters
  const offset = (page - 1) * limit

  const conditions = []

  if (actorId) {
    conditions.push(eq(auditLog.actorId, actorId))
  }
  if (actionType) {
    conditions.push(eq(auditLog.actionType, actionType))
  }
  if (startDate) {
    conditions.push(gte(auditLog.createdAt, startDate))
  }
  if (endDate) {
    conditions.push(lte(auditLog.createdAt, endDate))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const [entries, countResult] = await Promise.all([
    db
      .select({
        id: auditLog.id,
        actorId: auditLog.actorId,
        actorFirstName: users.firstName,
        actorLastName: users.lastName,
        actorEmail: users.email,
        actionType: auditLog.actionType,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        beforeState: auditLog.beforeState,
        afterState: auditLog.afterState,
        createdAt: auditLog.createdAt,
      })
      .from(auditLog)
      .innerJoin(users, eq(auditLog.actorId, users.id))
      .where(whereClause)
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLog)
      .where(whereClause),
  ])

  return {
    entries,
    totalCount: countResult[0]?.count ?? 0,
  }
}

// ─── getAuditActors ─────────────────────────────────────

export async function getAuditActors() {
  return db
    .selectDistinctOn([auditLog.actorId], {
      id: auditLog.actorId,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(auditLog)
    .innerJoin(users, eq(auditLog.actorId, users.id))
    .orderBy(auditLog.actorId)
}
