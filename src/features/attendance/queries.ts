import 'server-only'

import { db } from '@/db'
import { registrations, events } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'

// ─── canCorrectAttendance ───────────────────────────────

export async function canCorrectAttendance(
  registrationId: string
): Promise<{ canCorrect: boolean; reason?: string }> {
  const result = await db
    .select({
      registrationStatus: registrations.status,
      eventEndAt: events.endAt,
      attendanceGracePeriodHours: events.attendanceGracePeriodHours,
    })
    .from(registrations)
    .innerJoin(events, eq(registrations.eventId, events.id))
    .where(eq(registrations.id, registrationId))
    .limit(1)

  if (!result[0]) {
    return { canCorrect: false, reason: 'Iscrizione non trovata' }
  }

  const { registrationStatus, eventEndAt, attendanceGracePeriodHours } =
    result[0]

  if (registrationStatus !== 'confirmed') {
    return {
      canCorrect: false,
      reason:
        'Solo le iscrizioni confermate possono avere la presenza corretta',
    }
  }

  if (eventEndAt.getTime() > Date.now()) {
    return {
      canCorrect: false,
      reason: "L'evento non è ancora terminato",
    }
  }

  const gracePeriodMs = (attendanceGracePeriodHours ?? 48) * 3600000
  if (Date.now() - eventEndAt.getTime() > gracePeriodMs) {
    return {
      canCorrect: false,
      reason: 'Il periodo di correzione è scaduto',
    }
  }

  return { canCorrect: true }
}

// ─── getEventAttendanceSummary ──────────────────────────

export async function getEventAttendanceSummary(eventId: string) {
  const [result] = await db
    .select({
      present: sql<number>`count(*) filter (where ${registrations.attendanceStatus} = 'present')::int`,
      absent: sql<number>`count(*) filter (where ${registrations.attendanceStatus} = 'absent')::int`,
      noShow: sql<number>`count(*) filter (where ${registrations.attendanceStatus} = 'no_show')::int`,
      unmarked: sql<number>`count(*) filter (where ${registrations.attendanceStatus} is null)::int`,
    })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, eventId),
        eq(registrations.status, 'confirmed')
      )
    )

  return {
    present: result?.present ?? 0,
    absent: result?.absent ?? 0,
    noShow: result?.noShow ?? 0,
    unmarked: result?.unmarked ?? 0,
  }
}
