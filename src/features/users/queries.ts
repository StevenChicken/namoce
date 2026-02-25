import 'server-only'
import { db } from '@/db'
import { users, registrations, events } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'

export async function getPendingUsers() {
  return db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.status, 'pending'))
    .orderBy(users.createdAt)
}

export async function getAllUsers() {
  return db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt)
}

export async function getActiveVolunteers() {
  return db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(users)
    .where(eq(users.status, 'active'))
    .orderBy(users.lastName)
}

export async function getUserById(userId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return result[0] ?? null
}

// ─── getUserAttendanceSummary ──────────────────────────

export async function getUserAttendanceSummary(userId: string) {
  const rows = await db
    .select({
      category: sql<string>`${events.sectors}[1]`,
      presentCount: sql<number>`count(*)::int`,
    })
    .from(registrations)
    .innerJoin(events, eq(registrations.eventId, events.id))
    .where(
      and(
        eq(registrations.userId, userId),
        eq(registrations.attendanceStatus, 'present'),
        sql`${events.sectors} IS NOT NULL AND array_length(${events.sectors}, 1) > 0`
      )
    )
    .groupBy(sql`${events.sectors}[1]`)
    .orderBy(sql`${events.sectors}[1]`)

  return rows
}
