import 'server-only'

import { db } from '@/db'
import {
  registrations,
  externalRegistrations,
  events,
  users,
  userTagAssignments,
} from '@/db/schema'
import { eq, and, sql, asc, lt, or, gt, desc, ne } from 'drizzle-orm'

// ─── getRegistrationForUser ──────────────────────────────

export async function getRegistrationForUser(userId: string, eventId: string) {
  const result = await db
    .select()
    .from(registrations)
    .where(
      and(
        eq(registrations.userId, userId),
        eq(registrations.eventId, eventId)
      )
    )
    .limit(1)

  return result[0] ?? null
}

// ─── getActiveRegistrationForUser ────────────────────────

export async function getActiveRegistrationForUser(
  userId: string,
  eventId: string
) {
  const result = await db
    .select()
    .from(registrations)
    .where(
      and(
        eq(registrations.userId, userId),
        eq(registrations.eventId, eventId),
        or(
          eq(registrations.status, 'confirmed'),
          eq(registrations.status, 'waitlist')
        )
      )
    )
    .limit(1)

  return result[0] ?? null
}

// ─── getRegistrationsByEventId ───────────────────────────

export async function getRegistrationsByEventId(eventId: string) {
  return db
    .select({
      id: registrations.id,
      eventId: registrations.eventId,
      userId: registrations.userId,
      status: registrations.status,
      registeredAt: registrations.registeredAt,
      cancelledAt: registrations.cancelledAt,
      cancellationType: registrations.cancellationType,
      isAdminOverride: registrations.isAdminOverride,
      attendanceStatus: registrations.attendanceStatus,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(registrations)
    .innerJoin(users, eq(registrations.userId, users.id))
    .where(eq(registrations.eventId, eventId))
    .orderBy(asc(registrations.registeredAt))
}

// ─── getExternalRegistrationsByEventId ───────────────────

export async function getExternalRegistrationsByEventId(eventId: string) {
  return db
    .select()
    .from(externalRegistrations)
    .where(eq(externalRegistrations.eventId, eventId))
    .orderBy(asc(externalRegistrations.registeredAt))
}

// ─── getWaitlistPosition ─────────────────────────────────

export async function getWaitlistPosition(registrationId: string) {
  const reg = await db
    .select({
      eventId: registrations.eventId,
      registeredAt: registrations.registeredAt,
      status: registrations.status,
    })
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .limit(1)

  if (!reg[0] || reg[0].status !== 'waitlist') {
    return null
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, reg[0].eventId),
        eq(registrations.status, 'waitlist'),
        lt(registrations.registeredAt, reg[0].registeredAt)
      )
    )

  return (result?.count ?? 0) + 1
}

// ─── hasTimeOverlap ──────────────────────────────────────

export async function hasTimeOverlap(
  userId: string,
  startAt: Date,
  endAt: Date,
  excludeEventId?: string
) {
  const conditions = [
    eq(registrations.userId, userId),
    eq(registrations.status, 'confirmed'),
    // Overlap: existing.startAt < new.endAt AND existing.endAt > new.startAt
    lt(events.startAt, endAt),
    gt(events.endAt, startAt),
  ]

  if (excludeEventId) {
    conditions.push(ne(registrations.eventId, excludeEventId))
  }

  return db
    .select({
      registrationId: registrations.id,
      eventId: events.id,
      eventTitle: events.title,
      eventStartAt: events.startAt,
      eventEndAt: events.endAt,
    })
    .from(registrations)
    .innerJoin(events, eq(registrations.eventId, events.id))
    .where(and(...conditions))
}

// ─── getNextWaitlistedVolunteer ──────────────────────────

export async function getNextWaitlistedVolunteer(eventId: string) {
  const result = await db
    .select()
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, eventId),
        eq(registrations.status, 'waitlist')
      )
    )
    .orderBy(asc(registrations.registeredAt))
    .limit(1)

  return result[0] ?? null
}

// ─── getEventCapacityCounts ──────────────────────────────

export async function getEventCapacityCounts(eventId: string) {
  const [confirmed] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, eventId),
        eq(registrations.status, 'confirmed')
      )
    )

  const [waitlisted] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, eventId),
        eq(registrations.status, 'waitlist')
      )
    )

  const [externalConfirmed] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(externalRegistrations)
    .where(
      and(
        eq(externalRegistrations.eventId, eventId),
        eq(externalRegistrations.status, 'confirmed')
      )
    )

  const eventResult = await db
    .select({
      capacity: events.capacity,
      waitlistLimit: events.waitlistLimit,
    })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  return {
    confirmedCount: confirmed?.count ?? 0,
    waitlistCount: waitlisted?.count ?? 0,
    externalConfirmedCount: externalConfirmed?.count ?? 0,
    capacity: eventResult[0]?.capacity ?? null,
    waitlistLimit: eventResult[0]?.waitlistLimit ?? null,
  }
}

// ─── getUserRegistrations ────────────────────────────────

export async function getUserRegistrations(userId: string) {
  return db
    .select({
      id: registrations.id,
      status: registrations.status,
      registeredAt: registrations.registeredAt,
      cancelledAt: registrations.cancelledAt,
      cancellationType: registrations.cancellationType,
      attendanceStatus: registrations.attendanceStatus,
      eventId: events.id,
      eventTitle: events.title,
      eventType: events.type,
      eventStartAt: events.startAt,
      eventEndAt: events.endAt,
      eventLocation: events.location,
      eventStatus: events.status,
    })
    .from(registrations)
    .innerJoin(events, eq(registrations.eventId, events.id))
    .where(eq(registrations.userId, userId))
    .orderBy(asc(events.startAt))
}

// ─── getExternalRegistrationByCancelToken ────────────────

export async function getExternalRegistrationByCancelToken(
  cancelToken: string
) {
  const result = await db
    .select({
      id: externalRegistrations.id,
      eventId: externalRegistrations.eventId,
      firstName: externalRegistrations.firstName,
      lastName: externalRegistrations.lastName,
      email: externalRegistrations.email,
      status: externalRegistrations.status,
      cancelToken: externalRegistrations.cancelToken,
      registeredAt: externalRegistrations.registeredAt,
      cancelledAt: externalRegistrations.cancelledAt,
      eventTitle: events.title,
      eventStartAt: events.startAt,
    })
    .from(externalRegistrations)
    .innerJoin(events, eq(externalRegistrations.eventId, events.id))
    .where(eq(externalRegistrations.cancelToken, cancelToken))
    .limit(1)

  return result[0] ?? null
}

// ─── getUserTagIds ───────────────────────────────────────

export async function getUserTagIds(userId: string) {
  const tags = await db
    .select({ tagId: userTagAssignments.tagId })
    .from(userTagAssignments)
    .where(eq(userTagAssignments.userId, userId))

  return tags.map((t) => t.tagId)
}

// ─── getUpcomingUserRegistrations ────────────────────────

export async function getUpcomingUserRegistrations(userId: string) {
  return db
    .select({
      id: registrations.id,
      status: registrations.status,
      registeredAt: registrations.registeredAt,
      eventId: events.id,
      eventTitle: events.title,
      eventType: events.type,
      eventStartAt: events.startAt,
      eventEndAt: events.endAt,
      eventLocation: events.location,
      eventSectors: events.sectors,
    })
    .from(registrations)
    .innerJoin(events, eq(registrations.eventId, events.id))
    .where(
      and(
        eq(registrations.userId, userId),
        eq(registrations.status, 'confirmed'),
        gt(events.startAt, new Date())
      )
    )
    .orderBy(asc(events.startAt))
}

// ─── getPastUserRegistrations ────────────────────────────

export async function getPastUserRegistrations(userId: string, limit = 20) {
  return db
    .select({
      id: registrations.id,
      status: registrations.status,
      attendanceStatus: registrations.attendanceStatus,
      registeredAt: registrations.registeredAt,
      eventId: events.id,
      eventTitle: events.title,
      eventStartAt: events.startAt,
      eventEndAt: events.endAt,
    })
    .from(registrations)
    .innerJoin(events, eq(registrations.eventId, events.id))
    .where(
      and(
        eq(registrations.userId, userId),
        lt(events.endAt, new Date())
      )
    )
    .orderBy(desc(events.startAt))
    .limit(limit)
}
