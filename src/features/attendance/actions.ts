'use server'

import { db } from '@/db'
import { registrations } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createAuditEntry } from '@/lib/audit'
import { requireSuperAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { correctAttendanceSchema } from './schemas'
import { canCorrectAttendance } from './queries'

// ─── correctAttendance ──────────────────────────────────

export async function correctAttendance(data: unknown) {
  const actorId = await requireSuperAdmin()

  const parsed = correctAttendanceSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { registrationId, newStatus } = parsed.data

  const check = await canCorrectAttendance(registrationId)
  if (!check.canCorrect) {
    throw new Error(check.reason!)
  }

  const current = await db
    .select({
      attendanceStatus: registrations.attendanceStatus,
      eventId: registrations.eventId,
    })
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .limit(1)

  if (!current[0]) {
    throw new Error('Iscrizione non trovata')
  }

  const beforeState = { attendanceStatus: current[0].attendanceStatus }

  await db
    .update(registrations)
    .set({
      attendanceStatus: newStatus,
      attendanceCorrectedBy: actorId,
      attendanceCorrectedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(registrations.id, registrationId))

  await createAuditEntry({
    actorId,
    actionType: 'ATTENDANCE_CORRECTED',
    entityType: 'registration',
    entityId: registrationId,
    beforeState,
    afterState: { attendanceStatus: newStatus },
  })

  revalidatePath('/admin/eventi')
  revalidatePath('/admin/eventi/' + current[0].eventId)

  return { success: true }
}
