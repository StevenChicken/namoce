'use server'

import { db } from '@/db'
import {
  registrations,
  externalRegistrations,
  events,
  users,
} from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { createAuditEntry } from '@/lib/audit'
import { requireAuthenticated, requireSuperAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import {
  registerForEventSchema,
  confirmWaitlistJoinSchema,
  cancelRegistrationSchema,
  externalRegistrationSchema,
} from './schemas'
import {
  getActiveRegistrationForUser,
  getEventCapacityCounts,
  getNextWaitlistedVolunteer,
  getWaitlistPosition,
  hasTimeOverlap,
  getUserTagIds,
} from './queries'
import { sendRegistrationConfirmedEmail } from '@/features/notifications/send-registration-confirmed'
import { sendRegistrationCancelledEmail } from '@/features/notifications/send-registration-cancelled'
import { sendWaitlistPromotionEmail } from '@/features/notifications/send-waitlist-promotion'
import { sendExternalRegistrationConfirmedEmail } from '@/features/notifications/send-external-registration-confirmed'

function revalidateRegistrationPaths() {
  revalidatePath('/calendario')
  revalidatePath('/eventi')
  revalidatePath('/admin/eventi')
  revalidatePath('/dashboard')
}

// ─── registerForEvent ────────────────────────────────────

export async function registerForEvent(data: unknown) {
  const userId = await requireAuthenticated()

  const parsed = registerForEventSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { eventId, acceptOverlap } = parsed.data

  // Check user is active
  const userResult = await db
    .select({ status: users.status })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!userResult[0] || userResult[0].status !== 'active') {
    throw new Error('Il tuo account non è attivo')
  }

  // Check event exists, is published, and not ended
  const eventResult = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  if (!eventResult[0]) {
    throw new Error('Evento non trovato')
  }

  const event = eventResult[0]

  if (event.status !== 'published') {
    throw new Error('Questo evento non è disponibile per le iscrizioni')
  }

  if (event.endAt <= new Date()) {
    throw new Error('Questo evento è già terminato')
  }

  // Check no existing active registration
  const existingReg = await getActiveRegistrationForUser(userId, eventId)
  if (existingReg) {
    throw new Error('Sei già iscritto a questo evento')
  }

  // Check required tags
  if (event.requiredTags && event.requiredTags.length > 0) {
    const userTagIds = await getUserTagIds(userId)
    const missingTags = event.requiredTags.filter(
      (tagId) => !userTagIds.includes(tagId)
    )
    if (missingTags.length > 0) {
      throw new Error(
        'Non hai le qualifiche necessarie per iscriverti a questo evento'
      )
    }
  }

  // Check time overlap
  if (!acceptOverlap) {
    const conflicts = await hasTimeOverlap(
      userId,
      event.startAt,
      event.endAt,
      eventId
    )
    if (conflicts.length > 0) {
      return {
        needsOverlapConfirmation: true,
        conflicts: conflicts.map((c) => ({
          eventId: c.eventId,
          eventTitle: c.eventTitle,
          startAt: c.eventStartAt.toISOString(),
          endAt: c.eventEndAt.toISOString(),
        })),
      }
    }
  }

  // Check capacity within transaction
  const result = await db.transaction(async (tx) => {
    const [confirmedInternal] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(registrations)
      .where(
        and(
          eq(registrations.eventId, eventId),
          eq(registrations.status, 'confirmed')
        )
      )

    const [confirmedExternal] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(externalRegistrations)
      .where(
        and(
          eq(externalRegistrations.eventId, eventId),
          eq(externalRegistrations.status, 'confirmed')
        )
      )

    const totalConfirmed =
      (confirmedInternal?.count ?? 0) + (confirmedExternal?.count ?? 0)

    const hasCapacity =
      event.capacity === null || totalConfirmed < event.capacity

    if (hasCapacity) {
      // Confirmed registration
      const [newReg] = await tx
        .insert(registrations)
        .values({
          eventId,
          userId,
          status: 'confirmed',
        })
        .returning()

      return { registrationId: newReg.id, status: 'confirmed' as const }
    }

    // Event is full — check waitlist availability
    const [waitlistedCount] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(registrations)
      .where(
        and(
          eq(registrations.eventId, eventId),
          eq(registrations.status, 'waitlist')
        )
      )

    const currentWaitlistSize = waitlistedCount?.count ?? 0
    const waitlistAvailable =
      event.waitlistLimit === null ||
      currentWaitlistSize < event.waitlistLimit

    if (!waitlistAvailable) {
      throw new Error('Non ci sono posti disponibili')
    }

    // Return info so user can confirm joining waitlist
    return {
      needsWaitlistConfirmation: true,
      position: currentWaitlistSize + 1,
    }
  })

  if ('needsWaitlistConfirmation' in result) {
    return result
  }

  // Audit log for confirmed registration
  await createAuditEntry({
    actorId: userId,
    actionType: 'REGISTRATION_CREATED',
    entityType: 'registration',
    entityId: result.registrationId,
    afterState: {
      eventId,
      userId,
      status: 'confirmed',
    },
  })

  // Send confirmation email (fire-and-forget)
  const userData = await db
    .select({ email: users.email, firstName: users.firstName })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (userData[0]) {
    sendRegistrationConfirmedEmail({
      email: userData[0].email,
      firstName: userData[0].firstName || 'Volontario',
      eventTitle: event.title,
      startAt: event.startAt,
      location: event.location,
    })
  }

  revalidateRegistrationPaths()
  return result
}

// ─── confirmWaitlistJoin ─────────────────────────────────

export async function confirmWaitlistJoin(data: unknown) {
  const userId = await requireAuthenticated()

  const parsed = confirmWaitlistJoinSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { eventId } = parsed.data

  // Check user is active
  const userResult = await db
    .select({ status: users.status })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!userResult[0] || userResult[0].status !== 'active') {
    throw new Error('Il tuo account non è attivo')
  }

  // Check event exists and is published
  const eventResult = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  if (!eventResult[0]) {
    throw new Error('Evento non trovato')
  }

  const event = eventResult[0]

  if (event.status !== 'published') {
    throw new Error('Questo evento non è disponibile per le iscrizioni')
  }

  if (event.endAt <= new Date()) {
    throw new Error('Questo evento è già terminato')
  }

  // Check no existing active registration
  const existingReg = await getActiveRegistrationForUser(userId, eventId)
  if (existingReg) {
    throw new Error('Sei già iscritto a questo evento')
  }

  // Insert as waitlisted within transaction
  const newReg = await db.transaction(async (tx) => {
    // Re-check waitlist availability inside transaction
    const [waitlistedCount] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(registrations)
      .where(
        and(
          eq(registrations.eventId, eventId),
          eq(registrations.status, 'waitlist')
        )
      )

    const currentWaitlistSize = waitlistedCount?.count ?? 0
    const waitlistAvailable =
      event.waitlistLimit === null ||
      currentWaitlistSize < event.waitlistLimit

    if (!waitlistAvailable) {
      throw new Error("La lista d'attesa è piena")
    }

    const [reg] = await tx
      .insert(registrations)
      .values({
        eventId,
        userId,
        status: 'waitlist',
      })
      .returning()

    return reg
  })

  await createAuditEntry({
    actorId: userId,
    actionType: 'REGISTRATION_CREATED',
    entityType: 'registration',
    entityId: newReg.id,
    afterState: {
      eventId,
      userId,
      status: 'waitlist',
    },
  })

  const position = await getWaitlistPosition(newReg.id)

  revalidateRegistrationPaths()
  return { registrationId: newReg.id, status: 'waitlist' as const, position }
}

// ─── cancelRegistration ──────────────────────────────────

export async function cancelRegistration(data: unknown) {
  const userId = await requireAuthenticated()

  const parsed = cancelRegistrationSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { registrationId } = parsed.data

  // Fetch registration with event data
  const regResult = await db
    .select({
      id: registrations.id,
      eventId: registrations.eventId,
      userId: registrations.userId,
      status: registrations.status,
      eventStartAt: events.startAt,
      eventCancellationDeadlineHours: events.cancellationDeadlineHours,
    })
    .from(registrations)
    .innerJoin(events, eq(registrations.eventId, events.id))
    .where(eq(registrations.id, registrationId))
    .limit(1)

  if (!regResult[0]) {
    throw new Error('Iscrizione non trovata')
  }

  const reg = regResult[0]

  // Check ownership: user owns it or is super_admin
  const userRow = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const isSuperAdmin = userRow[0]?.role === 'super_admin'

  if (reg.userId !== userId && !isSuperAdmin) {
    throw new Error('Non autorizzato')
  }

  if (reg.status === 'cancelled') {
    throw new Error('Questa iscrizione è già stata annullata')
  }

  // Determine cancellation type
  let cancellationType: 'normal' | 'late' = 'normal'
  if (reg.eventCancellationDeadlineHours) {
    const deadlineMs =
      reg.eventCancellationDeadlineHours * 60 * 60 * 1000
    const timeUntilEvent =
      reg.eventStartAt.getTime() - Date.now()
    if (timeUntilEvent < deadlineMs) {
      cancellationType = 'late'
    }
  }

  const wasConfirmed = reg.status === 'confirmed'
  const beforeState = { status: reg.status }

  // Update registration
  await db
    .update(registrations)
    .set({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationType,
      updatedAt: new Date(),
    })
    .where(eq(registrations.id, registrationId))

  // Determine audit action type based on who cancelled
  const actionType =
    isSuperAdmin && reg.userId !== userId
      ? 'REGISTRATION_CANCELLED_BY_ADMIN'
      : 'REGISTRATION_CANCELLED_BY_VOLUNTEER'

  await createAuditEntry({
    actorId: userId,
    actionType,
    entityType: 'registration',
    entityId: registrationId,
    beforeState,
    afterState: {
      status: 'cancelled',
      cancellationType,
    },
  })

  // Send cancellation email (fire-and-forget)
  const cancelledUser = await db
    .select({ email: users.email, firstName: users.firstName })
    .from(users)
    .where(eq(users.id, reg.userId))
    .limit(1)
  if (cancelledUser[0]) {
    const eventForEmail = await db
      .select({ title: events.title, startAt: events.startAt })
      .from(events)
      .where(eq(events.id, reg.eventId))
      .limit(1)
    if (eventForEmail[0]) {
      sendRegistrationCancelledEmail({
        email: cancelledUser[0].email,
        firstName: cancelledUser[0].firstName || 'Volontario',
        eventTitle: eventForEmail[0].title,
        startAt: eventForEmail[0].startAt,
        cancelledBy: isSuperAdmin && reg.userId !== userId ? 'admin' : 'self',
      })
    }
  }

  // If was confirmed, promote from waitlist
  if (wasConfirmed) {
    await promoteFromWaitlist(reg.eventId)
  }

  revalidateRegistrationPaths()
  return { success: true, cancellationType }
}

// ─── promoteFromWaitlist ─────────────────────────────────

export async function promoteFromWaitlist(eventId: string) {
  const nextInLine = await getNextWaitlistedVolunteer(eventId)
  if (!nextInLine) {
    return null
  }

  await db
    .update(registrations)
    .set({
      status: 'confirmed',
      updatedAt: new Date(),
    })
    .where(eq(registrations.id, nextInLine.id))

  await createAuditEntry({
    actorId: nextInLine.userId,
    actionType: 'WAITLIST_PROMOTION',
    entityType: 'registration',
    entityId: nextInLine.id,
    beforeState: { status: 'waitlist' },
    afterState: { status: 'confirmed' },
  })

  // Send waitlist promotion email (fire-and-forget)
  const promotedUser = await db
    .select({ email: users.email, firstName: users.firstName })
    .from(users)
    .where(eq(users.id, nextInLine.userId))
    .limit(1)
  const eventForEmail = await db
    .select({
      title: events.title,
      startAt: events.startAt,
      location: events.location,
    })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)
  if (promotedUser[0] && eventForEmail[0]) {
    sendWaitlistPromotionEmail({
      email: promotedUser[0].email,
      firstName: promotedUser[0].firstName || 'Volontario',
      eventTitle: eventForEmail[0].title,
      startAt: eventForEmail[0].startAt,
      location: eventForEmail[0].location,
      registrationId: nextInLine.id,
    })
  }

  return nextInLine
}

// ─── adminRegisterVolunteer ──────────────────────────────

export async function adminRegisterVolunteer(
  eventId: string,
  targetUserId: string
) {
  const actorId = await requireSuperAdmin()

  // Check event exists
  const eventResult = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  if (!eventResult[0]) {
    throw new Error('Evento non trovato')
  }

  // Check user exists and is active
  const userResult = await db
    .select({ id: users.id, status: users.status })
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1)

  if (!userResult[0]) {
    throw new Error('Utente non trovato')
  }

  if (userResult[0].status !== 'active') {
    throw new Error("L'utente non è attivo")
  }

  // Check no existing active registration
  const existingReg = await getActiveRegistrationForUser(
    targetUserId,
    eventId
  )
  if (existingReg) {
    throw new Error("L'utente è già iscritto a questo evento")
  }

  // Admin override — always confirmed regardless of capacity
  const [newReg] = await db
    .insert(registrations)
    .values({
      eventId,
      userId: targetUserId,
      status: 'confirmed',
      isAdminOverride: true,
    })
    .returning()

  await createAuditEntry({
    actorId,
    actionType: 'CAPACITY_OVERRIDE',
    entityType: 'registration',
    entityId: newReg.id,
    afterState: {
      eventId,
      userId: targetUserId,
      status: 'confirmed',
      isAdminOverride: true,
    },
  })

  revalidateRegistrationPaths()
  return { registrationId: newReg.id }
}

// ─── registerExternalUser ────────────────────────────────

export async function registerExternalUser(data: unknown) {
  const parsed = externalRegistrationSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { eventId, firstName, lastName, email, phone } = parsed.data

  // Check event exists, is published, is aperto, and not ended
  const eventResult = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  if (!eventResult[0]) {
    throw new Error('Evento non trovato')
  }

  const event = eventResult[0]

  if (event.status !== 'published') {
    throw new Error('Questo evento non è disponibile per le iscrizioni')
  }

  if (event.type !== 'aperto') {
    throw new Error('Questo evento non è aperto alle iscrizioni esterne')
  }

  if (event.endAt <= new Date()) {
    throw new Error('Questo evento è già terminato')
  }

  // Check capacity
  const result = await db.transaction(async (tx) => {
    const [confirmedInternal] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(registrations)
      .where(
        and(
          eq(registrations.eventId, eventId),
          eq(registrations.status, 'confirmed')
        )
      )

    const [confirmedExternal] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(externalRegistrations)
      .where(
        and(
          eq(externalRegistrations.eventId, eventId),
          eq(externalRegistrations.status, 'confirmed')
        )
      )

    const totalConfirmed =
      (confirmedInternal?.count ?? 0) + (confirmedExternal?.count ?? 0)

    if (event.capacity !== null && totalConfirmed >= event.capacity) {
      throw new Error('Evento al completo')
    }

    // Check duplicate by email
    const [existing] = await tx
      .select({ id: externalRegistrations.id })
      .from(externalRegistrations)
      .where(
        and(
          eq(externalRegistrations.eventId, eventId),
          eq(externalRegistrations.email, email),
          eq(externalRegistrations.status, 'confirmed')
        )
      )
      .limit(1)

    if (existing) {
      throw new Error('Sei già iscritto a questo evento')
    }

    // Insert external registration (cancelToken auto-generated by DB default)
    const [newExtReg] = await tx
      .insert(externalRegistrations)
      .values({
        eventId,
        firstName,
        lastName,
        email,
        phoneEncrypted: phone ?? null,
        status: 'confirmed',
      })
      .returning({
        id: externalRegistrations.id,
        status: externalRegistrations.status,
        cancelToken: externalRegistrations.cancelToken,
      })

    return newExtReg
  })

  // Send external registration confirmation email (fire-and-forget)
  sendExternalRegistrationConfirmedEmail({
    email,
    firstName,
    eventTitle: event.title,
    startAt: event.startAt,
    location: event.location,
    cancelToken: result.cancelToken,
  })

  revalidateRegistrationPaths()
  return { id: result.id, status: result.status }
}

// ─── cancelExternalRegistration ──────────────────────────

export async function cancelExternalRegistration(cancelToken: string) {
  // Find external registration by cancel token
  const extReg = await db
    .select()
    .from(externalRegistrations)
    .where(eq(externalRegistrations.cancelToken, cancelToken))
    .limit(1)

  if (!extReg[0]) {
    throw new Error('Iscrizione non trovata')
  }

  if (extReg[0].status === 'cancelled') {
    throw new Error('Questa iscrizione è già stata annullata')
  }

  const eventId = extReg[0].eventId

  // Update status
  await db
    .update(externalRegistrations)
    .set({
      status: 'cancelled',
      cancelledAt: new Date(),
    })
    .where(eq(externalRegistrations.id, extReg[0].id))

  // Check if this frees a spot for internal waitlist promotion
  const counts = await getEventCapacityCounts(eventId)
  const totalConfirmed =
    counts.confirmedCount + counts.externalConfirmedCount
  if (counts.capacity !== null && totalConfirmed < counts.capacity) {
    await promoteFromWaitlist(eventId)
  }

  // Get event title for return value
  const eventResult = await db
    .select({ title: events.title })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  revalidateRegistrationPaths()
  return { success: true, eventTitle: eventResult[0]?.title ?? '' }
}
