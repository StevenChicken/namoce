import 'server-only'

import { db } from '@/db'
import { events, registrations, users } from '@/db/schema'
import { eq, and, gte, lte, isNotNull, asc } from 'drizzle-orm'

// ─── getAttendanceExportData ─────────────────────────────

interface AttendanceExportFilters {
  startDate: Date
  endDate: Date
}

export async function getAttendanceExportData(filters: AttendanceExportFilters) {
  return db
    .select({
      eventTitle: events.title,
      eventStartAt: events.startAt,
      eventSectors: events.sectors,
      volunteerFirstName: users.firstName,
      volunteerLastName: users.lastName,
      volunteerEmail: users.email,
      attendanceStatus: registrations.attendanceStatus,
    })
    .from(registrations)
    .innerJoin(events, eq(registrations.eventId, events.id))
    .innerJoin(users, eq(registrations.userId, users.id))
    .where(
      and(
        isNotNull(registrations.attendanceStatus),
        gte(events.startAt, filters.startDate),
        lte(events.startAt, filters.endDate)
      )
    )
    .orderBy(asc(events.startAt), asc(users.lastName))
}

// ─── getPersonalExportData ───────────────────────────────

export async function getPersonalExportData(userId: string) {
  const [user] = await db
    .select({
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const regs = await db
    .select({
      registrationId: registrations.id,
      registrationStatus: registrations.status,
      registeredAt: registrations.registeredAt,
      cancelledAt: registrations.cancelledAt,
      attendanceStatus: registrations.attendanceStatus,
      eventTitle: events.title,
      eventType: events.type,
      eventStartAt: events.startAt,
      eventEndAt: events.endAt,
      eventLocation: events.location,
    })
    .from(registrations)
    .innerJoin(events, eq(registrations.eventId, events.id))
    .where(eq(registrations.userId, userId))
    .orderBy(asc(events.startAt))

  return { user: user ?? null, registrations: regs }
}
