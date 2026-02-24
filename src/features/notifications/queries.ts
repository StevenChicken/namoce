import 'server-only'

import { db } from '@/db'
import {
  registrations,
  events,
  users,
  notificationPreferences,
} from '@/db/schema'
import { eq, and, sql, isNull } from 'drizzle-orm'

// ─── getNotificationPreferences ─────────────────────────

export async function getNotificationPreferences(userId: string) {
  const result = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1)

  return result[0] ?? null
}

// ─── getVolunteersForEvent ──────────────────────────────

export async function getVolunteersForEvent(eventId: string) {
  return db
    .select({
      email: users.email,
      firstName: users.firstName,
    })
    .from(registrations)
    .innerJoin(users, eq(registrations.userId, users.id))
    .where(
      and(
        eq(registrations.eventId, eventId),
        eq(registrations.status, 'confirmed')
      )
    )
}

// ─── getVolunteersByEventSectors ────────────────────────

export async function getVolunteersByEventSectors(sectors: string[]) {
  if (sectors.length === 0) return []

  return db
    .select({
      email: users.email,
      firstName: users.firstName,
      userId: users.id,
    })
    .from(users)
    .leftJoin(
      notificationPreferences,
      eq(users.id, notificationPreferences.userId)
    )
    .where(
      and(
        eq(users.status, 'active'),
        sql`${users.sectorsOfInterest} && ${sql.raw(`ARRAY[${sectors.map((s) => `'${s.replace(/'/g, "''")}'`).join(',')}]::text[]`)}`,
        sql`COALESCE(${notificationPreferences.informationalEmailsEnabled}, true) = true`
      )
    )
}

// ─── getRegistrationWithUserAndEvent ────────────────────

export async function getRegistrationWithUserAndEvent(
  registrationId: string
) {
  const result = await db
    .select({
      registrationId: registrations.id,
      registrationStatus: registrations.status,
      userEmail: users.email,
      userFirstName: users.firstName,
      userId: users.id,
      eventId: events.id,
      eventTitle: events.title,
      eventStartAt: events.startAt,
      eventLocation: events.location,
    })
    .from(registrations)
    .innerJoin(users, eq(registrations.userId, users.id))
    .innerJoin(events, eq(registrations.eventId, events.id))
    .where(eq(registrations.id, registrationId))
    .limit(1)

  return result[0] ?? null
}

// ─── getUpcomingEventReminders ──────────────────────────

export async function getUpcomingEventReminders() {
  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.status, 'published'),
        isNull(events.reminderSentAt),
        sql`${events.reminderHours} IS NOT NULL`,
        sql`NOW() >= ${events.startAt} - (${events.reminderHours} * interval '1 hour')`,
        sql`${events.startAt} > NOW()`
      )
    )
}
