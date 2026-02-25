import 'server-only'

import { db } from '@/db'
import { events, registrations } from '@/db/schema'
import { eq, and, sql, desc, asc, gte } from 'drizzle-orm'
import { requireAdmin, requireAuthenticated, requireVolunteerOrAdmin } from '@/lib/auth'

interface EventFilters {
  status?: 'draft' | 'published' | 'cancelled' | 'archived'
  type?: 'interno' | 'aperto'
  sector?: string
}

export async function getAllEvents(filters?: EventFilters) {
  await requireAdmin()

  const conditions = []

  if (filters?.status) {
    conditions.push(eq(events.status, filters.status))
  }
  if (filters?.type) {
    conditions.push(eq(events.type, filters.type))
  }
  if (filters?.sector) {
    conditions.push(sql`${filters.sector} = ANY(${events.sectors})`)
  }

  return db
    .select()
    .from(events)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(events.startAt))
}

export async function getEventById(eventId: string) {
  await requireAdmin()

  const eventResult = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  if (!eventResult[0]) {
    return null
  }

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

  return {
    ...eventResult[0],
    confirmedCount: confirmed?.count ?? 0,
    waitlistCount: waitlisted?.count ?? 0,
  }
}

export async function getPublishedEvents(sectorFilter?: string) {
  await requireAuthenticated()

  const conditions = [eq(events.status, 'published')]

  if (sectorFilter) {
    conditions.push(sql`${sectorFilter} = ANY(${events.sectors})`)
  }

  return db
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy(desc(events.startAt))
}

export async function getPublishedApertoEvents(sectorFilter?: string) {
  const conditions = [
    eq(events.status, 'published'),
    eq(events.type, 'aperto'),
  ]

  if (sectorFilter) {
    conditions.push(sql`${sectorFilter} = ANY(${events.sectors})`)
  }

  return db
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy(desc(events.startAt))
}

export async function getPublishedApertoEventsWithCounts() {
  const now = new Date()

  return db
    .select({
      id: events.id,
      title: events.title,
      type: events.type,
      status: events.status,
      sectors: events.sectors,
      startAt: events.startAt,
      endAt: events.endAt,
      location: events.location,
      capacity: events.capacity,
      notes: events.notes,
      confirmedCount: sql<number>`(
        COALESCE((SELECT COUNT(*)::int FROM registrations WHERE registrations.event_id = ${events.id} AND registrations.status = 'confirmed'), 0)
        + COALESCE((SELECT COUNT(*)::int FROM external_registrations WHERE external_registrations.event_id = ${events.id} AND external_registrations.status = 'confirmed'), 0)
      )`,
    })
    .from(events)
    .where(
      and(
        eq(events.status, 'published'),
        eq(events.type, 'aperto'),
        gte(events.endAt, now)
      )
    )
    .orderBy(asc(events.startAt))
}

// ─── getPublishedInternoEventsWithCounts ────────────────
// For the volunteer calendar — only interno events

export async function getPublishedInternoEventsWithCounts() {
  await requireVolunteerOrAdmin()

  const now = new Date()

  return db
    .select({
      id: events.id,
      title: events.title,
      type: events.type,
      status: events.status,
      sectors: events.sectors,
      startAt: events.startAt,
      endAt: events.endAt,
      location: events.location,
      capacity: events.capacity,
      notes: events.notes,
      confirmedCount: sql<number>`COALESCE((SELECT COUNT(*)::int FROM registrations WHERE registrations.event_id = ${events.id} AND registrations.status = 'confirmed'), 0)`,
      waitlistCount: sql<number>`COALESCE((SELECT COUNT(*)::int FROM registrations WHERE registrations.event_id = ${events.id} AND registrations.status = 'waitlist'), 0)`,
    })
    .from(events)
    .where(
      and(
        eq(events.status, 'published'),
        eq(events.type, 'interno'),
        gte(events.endAt, now)
      )
    )
    .orderBy(asc(events.startAt))
}

export async function getPublishedEventsWithCounts() {
  await requireAuthenticated()

  const now = new Date()

  return db
    .select({
      id: events.id,
      title: events.title,
      type: events.type,
      status: events.status,
      sectors: events.sectors,
      startAt: events.startAt,
      endAt: events.endAt,
      location: events.location,
      capacity: events.capacity,
      notes: events.notes,
      confirmedCount: sql<number>`(
        COALESCE((SELECT COUNT(*)::int FROM registrations WHERE registrations.event_id = ${events.id} AND registrations.status = 'confirmed'), 0)
        + COALESCE((SELECT COUNT(*)::int FROM external_registrations WHERE external_registrations.event_id = ${events.id} AND external_registrations.status = 'confirmed'), 0)
      )`,
    })
    .from(events)
    .where(
      and(
        eq(events.status, 'published'),
        gte(events.endAt, now)
      )
    )
    .orderBy(asc(events.startAt))
}

export async function getPublishedEventById(eventId: string) {
  await requireAuthenticated()

  const result = await db
    .select({
      id: events.id,
      title: events.title,
      type: events.type,
      status: events.status,
      sectors: events.sectors,
      startAt: events.startAt,
      endAt: events.endAt,
      location: events.location,
      capacity: events.capacity,
      minVolunteers: events.minVolunteers,
      notes: events.notes,
      fileUrl: events.fileUrl,
      cancellationDeadlineHours: events.cancellationDeadlineHours,
      waitlistLimit: events.waitlistLimit,
      createdAt: events.createdAt,
      confirmedCount: sql<number>`(
        COALESCE((SELECT COUNT(*)::int FROM registrations WHERE registrations.event_id = ${events.id} AND registrations.status = 'confirmed'), 0)
        + COALESCE((SELECT COUNT(*)::int FROM external_registrations WHERE external_registrations.event_id = ${events.id} AND external_registrations.status = 'confirmed'), 0)
      )`,
      waitlistCount: sql<number>`COALESCE((SELECT COUNT(*)::int FROM registrations WHERE registrations.event_id = ${events.id} AND registrations.status = 'waitlist'), 0)`,
    })
    .from(events)
    .where(
      and(
        eq(events.id, eventId),
        eq(events.status, 'published')
      )
    )
    .limit(1)

  return result[0] ?? null
}

export async function getEventsByCloneSeries(cloneSeriesId: string) {
  await requireAdmin()

  return db
    .select()
    .from(events)
    .where(eq(events.cloneSeriesId, cloneSeriesId))
    .orderBy(desc(events.startAt))
}
