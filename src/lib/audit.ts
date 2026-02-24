import 'server-only'
import { db } from '@/db'
import { auditLog } from '@/db/schema'

interface CreateAuditEntryParams {
  actorId: string
  actionType: string
  entityType: string
  entityId?: string
  beforeState?: Record<string, unknown>
  afterState?: Record<string, unknown>
}

export async function createAuditEntry({
  actorId,
  actionType,
  entityType,
  entityId,
  beforeState,
  afterState,
}: CreateAuditEntryParams) {
  await db.insert(auditLog).values({
    actorId,
    actionType,
    entityType,
    entityId,
    beforeState,
    afterState,
  })
}
