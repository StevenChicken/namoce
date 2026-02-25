'use server'

import { db } from '@/db'
import { events, registrations, externalRegistrations, users, adminCategoryPermissions } from '@/db/schema'
import { eq, and, sql, gte, inArray, isNotNull } from 'drizzle-orm'
import { createAuditEntry } from '@/lib/audit'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { eventFormSchema, eventSeriesUpdateSchema } from './schemas'
import { randomUUID } from 'crypto'
import { getVolunteersForNewEventNotification, getVolunteersForEvent } from '@/features/notifications/queries'
import { sendNewEventNotificationEmail } from '@/features/notifications/send-new-event-notification'
import { sendEventModifiedEmail } from '@/features/notifications/send-event-modified'

function buildChangesSummary(
  before: { title: string; startAt: Date; endAt: Date; location: string | null; capacity: number | null },
  after: { title: string; startAt: Date; endAt: Date; location: string | null; capacity: number | null }
): string {
  const changes: string[] = []
  if (before.title !== after.title) changes.push('Titolo aggiornato')
  if (before.startAt.getTime() !== after.startAt.getTime() || before.endAt.getTime() !== after.endAt.getTime())
    changes.push('Data/ora modificata')
  if (before.location !== after.location) changes.push('Luogo aggiornato')
  if (before.capacity !== after.capacity) changes.push('Capacità modificata')
  return changes.length > 0 ? changes.join(', ') : 'Dettagli evento aggiornati'
}

function revalidateEventPaths() {
  revalidatePath('/admin/eventi')
  revalidatePath('/calendario_del_volontario')
  revalidatePath('/calendario_eventi')
}

function shiftEventDates(
  sourceStartAt: Date,
  sourceEndAt: Date,
  targetDateStr: string
): { startAt: Date; endAt: Date } {
  const targetMidnight = new Date(targetDateStr + 'T00:00:00.000Z')
  const sourceMidnight = new Date(
    Date.UTC(
      sourceStartAt.getUTCFullYear(),
      sourceStartAt.getUTCMonth(),
      sourceStartAt.getUTCDate()
    )
  )
  const offsetMs = targetMidnight.getTime() - sourceMidnight.getTime()

  return {
    startAt: new Date(sourceStartAt.getTime() + offsetMs),
    endAt: new Date(sourceEndAt.getTime() + offsetMs),
  }
}

// ─── Category authorization helper ──────────────────────

async function checkCategoryAuthorization(actorId: string, category: string | null) {
  if (!category) return

  const actor = await db
    .select({ adminLevel: users.adminLevel })
    .from(users)
    .where(eq(users.id, actorId))
    .limit(1)

  // Super admins can manage all categories
  if (actor[0]?.adminLevel === 'super_admin') return

  // Regular admins need category permission
  const permission = await db
    .select({ id: adminCategoryPermissions.id })
    .from(adminCategoryPermissions)
    .where(
      and(
        eq(adminCategoryPermissions.userId, actorId),
        eq(adminCategoryPermissions.category, category)
      )
    )
    .limit(1)

  if (!permission[0]) {
    throw new Error('Non hai i permessi per gestire eventi di questa categoria')
  }
}

// ─── createEvent ───────────────────────────────────────

export async function createEvent(data: unknown) {
  const actorId = await requireAdmin()

  const parsed = eventFormSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  await checkCategoryAuthorization(actorId, parsed.data.category ?? null)

  const [newEvent] = await db
    .insert(events)
    .values({
      title: parsed.data.title,
      type: parsed.data.type,
      sectors: parsed.data.category ? [parsed.data.category] : null,
      startAt: parsed.data.startAt,
      endAt: parsed.data.endAt,
      location: parsed.data.location,
      capacity: parsed.data.capacity,
      minVolunteers: parsed.data.minVolunteers ?? null,
      requiredTags: parsed.data.requiredTags ?? null,
      notes: parsed.data.notes ?? null,
      cancellationDeadlineHours: parsed.data.cancellationDeadlineHours ?? null,
      waitlistLimit: parsed.data.waitlistLimit ?? null,
      reminderHours: parsed.data.reminderHours ?? null,
      attendanceGracePeriodHours: parsed.data.attendanceGracePeriodHours ?? null,
      status: 'draft',
      createdBy: actorId,
    })
    .returning()

  await createAuditEntry({
    actorId,
    actionType: 'EVENT_CREATED',
    entityType: 'event',
    entityId: newEvent.id,
    afterState: {
      title: newEvent.title,
      type: newEvent.type,
      status: newEvent.status,
      startAt: newEvent.startAt.toISOString(),
      endAt: newEvent.endAt.toISOString(),
    },
  })

  revalidateEventPaths()
  return { eventId: newEvent.id }
}

// ─── updateEvent ───────────────────────────────────────

export async function updateEvent(eventId: string, data: unknown) {
  const actorId = await requireAdmin()

  const parsed = eventFormSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const currentEvent = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  if (!currentEvent[0]) {
    throw new Error('Evento non trovato')
  }

  // Check authorization for both current and new category
  await checkCategoryAuthorization(actorId, currentEvent[0].sectors?.[0] ?? null)
  await checkCategoryAuthorization(actorId, parsed.data.category ?? null)

  const beforeState = {
    title: currentEvent[0].title,
    type: currentEvent[0].type,
    status: currentEvent[0].status,
    startAt: currentEvent[0].startAt.toISOString(),
    endAt: currentEvent[0].endAt.toISOString(),
    location: currentEvent[0].location,
    capacity: currentEvent[0].capacity,
  }

  const [updated] = await db
    .update(events)
    .set({
      title: parsed.data.title,
      type: parsed.data.type,
      sectors: parsed.data.category ? [parsed.data.category] : null,
      startAt: parsed.data.startAt,
      endAt: parsed.data.endAt,
      location: parsed.data.location,
      capacity: parsed.data.capacity,
      minVolunteers: parsed.data.minVolunteers ?? null,
      requiredTags: parsed.data.requiredTags ?? null,
      notes: parsed.data.notes ?? null,
      cancellationDeadlineHours: parsed.data.cancellationDeadlineHours ?? null,
      waitlistLimit: parsed.data.waitlistLimit ?? null,
      reminderHours: parsed.data.reminderHours ?? null,
      attendanceGracePeriodHours: parsed.data.attendanceGracePeriodHours ?? null,
      updatedAt: new Date(),
    })
    .where(eq(events.id, eventId))
    .returning()

  await createAuditEntry({
    actorId,
    actionType: 'EVENT_UPDATED',
    entityType: 'event',
    entityId: eventId,
    beforeState,
    afterState: {
      title: updated.title,
      type: updated.type,
      status: updated.status,
      startAt: updated.startAt.toISOString(),
      endAt: updated.endAt.toISOString(),
      location: updated.location,
      capacity: updated.capacity,
    },
  })

  // Send event-modified emails if event is published (fire-and-forget)
  if (currentEvent[0].status === 'published') {
    const changesSummary = buildChangesSummary(currentEvent[0], updated)
    getVolunteersForEvent(eventId).then((volunteers) => {
      for (const vol of volunteers) {
        sendEventModifiedEmail({
          email: vol.email,
          firstName: vol.firstName || 'Volontario',
          eventTitle: updated.title,
          changesSummary,
          eventId,
        })
      }
    }).catch((error) => {
      console.error('Errore invio email modifica evento:', error)
    })
  }

  revalidateEventPaths()
  return { eventId }
}

// ─── publishEvent ──────────────────────────────────────

export async function publishEvent(eventId: string) {
  const actorId = await requireAdmin()

  const currentEvent = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  if (!currentEvent[0]) {
    throw new Error('Evento non trovato')
  }

  if (currentEvent[0].status !== 'draft') {
    throw new Error('Solo gli eventi in bozza possono essere pubblicati')
  }

  await checkCategoryAuthorization(actorId, currentEvent[0].sectors?.[0] ?? null)

  await db
    .update(events)
    .set({ status: 'published', updatedAt: new Date() })
    .where(eq(events.id, eventId))

  await createAuditEntry({
    actorId,
    actionType: 'EVENT_UPDATED',
    entityType: 'event',
    entityId: eventId,
    beforeState: { status: currentEvent[0].status },
    afterState: { status: 'published' },
  })

  // Send new-event notification emails to all active volunteers (fire-and-forget)
  if (currentEvent[0].type === 'interno') {
    getVolunteersForNewEventNotification().then((volunteers) => {
      for (const vol of volunteers) {
        sendNewEventNotificationEmail({
          email: vol.email,
          firstName: vol.firstName || 'Volontario',
          eventTitle: currentEvent[0].title,
          startAt: currentEvent[0].startAt,
          location: currentEvent[0].location,
          category: currentEvent[0].sectors?.[0] ?? null,
          eventId,
        })
      }
    }).catch((error) => {
      console.error('Errore invio email nuovo evento:', error)
    })
  }

  revalidateEventPaths()
}

// ─── cancelEvent ───────────────────────────────────────

export async function cancelEvent(eventId: string) {
  const actorId = await requireAdmin()

  const currentEvent = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  if (!currentEvent[0]) {
    throw new Error('Evento non trovato')
  }

  if (currentEvent[0].status === 'cancelled') {
    throw new Error("L'evento è già stato annullato")
  }

  await checkCategoryAuthorization(actorId, currentEvent[0].sectors?.[0] ?? null)

  await db
    .update(events)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(events.id, eventId))

  await createAuditEntry({
    actorId,
    actionType: 'EVENT_CANCELLED',
    entityType: 'event',
    entityId: eventId,
    beforeState: { status: currentEvent[0].status },
    afterState: { status: 'cancelled' },
  })

  revalidateEventPaths()
}

// ─── deleteEvent ───────────────────────────────────────

export async function deleteEvent(eventId: string) {
  const actorId = await requireAdmin()

  const currentEvent = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  if (!currentEvent[0]) {
    throw new Error('Evento non trovato')
  }

  if (currentEvent[0].status !== 'cancelled') {
    throw new Error("Solo gli eventi annullati possono essere eliminati")
  }

  if (currentEvent[0].endAt > new Date()) {
    throw new Error("Solo gli eventi passati possono essere eliminati")
  }

  await checkCategoryAuthorization(actorId, currentEvent[0].sectors?.[0] ?? null)

  // Check for registrations with attendance data
  const [regsWithAttendance] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, eventId),
        isNotNull(registrations.attendanceStatus)
      )
    )

  if ((regsWithAttendance?.count ?? 0) > 0) {
    throw new Error(
      'Non è possibile eliminare un evento con dati di presenza registrati'
    )
  }

  const beforeState = {
    title: currentEvent[0].title,
    type: currentEvent[0].type,
    status: currentEvent[0].status,
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(registrations)
      .where(eq(registrations.eventId, eventId))
    await tx
      .delete(externalRegistrations)
      .where(eq(externalRegistrations.eventId, eventId))
    await tx.delete(events).where(eq(events.id, eventId))
  })

  await createAuditEntry({
    actorId,
    actionType: 'EVENT_DELETED',
    entityType: 'event',
    entityId: eventId,
    beforeState,
  })

  revalidateEventPaths()
}

// ─── cloneEvent ────────────────────────────────────────

export async function cloneEvent(
  sourceEventId: string,
  targetDate: string
) {
  const actorId = await requireAdmin()

  const sourceEvent = await db
    .select()
    .from(events)
    .where(eq(events.id, sourceEventId))
    .limit(1)

  if (!sourceEvent[0]) {
    throw new Error('Evento sorgente non trovato')
  }

  await checkCategoryAuthorization(actorId, sourceEvent[0].sectors?.[0] ?? null)

  const source = sourceEvent[0]
  const { startAt, endAt } = shiftEventDates(source.startAt, source.endAt, targetDate)

  let seriesId = source.cloneSeriesId
  if (!seriesId) {
    seriesId = randomUUID()
    // Mark the source as part of the series
    await db
      .update(events)
      .set({ cloneSeriesId: seriesId, updatedAt: new Date() })
      .where(eq(events.id, sourceEventId))
  }

  const [clonedEvent] = await db
    .insert(events)
    .values({
      title: source.title,
      type: source.type,
      sectors: source.sectors,
      startAt,
      endAt,
      location: source.location,
      capacity: source.capacity,
      minVolunteers: source.minVolunteers,
      requiredTags: source.requiredTags,
      notes: source.notes,
      cancellationDeadlineHours: source.cancellationDeadlineHours,
      waitlistLimit: source.waitlistLimit,
      reminderHours: source.reminderHours,
      attendanceGracePeriodHours: source.attendanceGracePeriodHours,
      cloneSeriesId: seriesId,
      status: 'draft',
      createdBy: actorId,
    })
    .returning()

  await createAuditEntry({
    actorId,
    actionType: 'EVENT_CREATED',
    entityType: 'event',
    entityId: clonedEvent.id,
    afterState: {
      title: clonedEvent.title,
      type: clonedEvent.type,
      status: clonedEvent.status,
      startAt: clonedEvent.startAt.toISOString(),
      endAt: clonedEvent.endAt.toISOString(),
      clonedFrom: sourceEventId,
      cloneSeriesId: seriesId,
    },
  })

  revalidateEventPaths()
  return { eventId: clonedEvent.id }
}

// ─── bulkCloneEvents ──────────────────────────────────

export async function bulkCloneEvents(
  sourceEventId: string,
  targetDates: string[]
) {
  const actorId = await requireAdmin()

  if (targetDates.length === 0) {
    throw new Error('Seleziona almeno una data di destinazione')
  }

  const sourceEvent = await db
    .select()
    .from(events)
    .where(eq(events.id, sourceEventId))
    .limit(1)

  if (!sourceEvent[0]) {
    throw new Error('Evento sorgente non trovato')
  }

  await checkCategoryAuthorization(actorId, sourceEvent[0].sectors?.[0] ?? null)

  const source = sourceEvent[0]
  let seriesId = source.cloneSeriesId
  if (!seriesId) {
    seriesId = randomUUID()
    await db
      .update(events)
      .set({ cloneSeriesId: seriesId, updatedAt: new Date() })
      .where(eq(events.id, sourceEventId))
  }

  const clonedEvents = await db.transaction(async (tx) => {
    const results = []
    for (const dateStr of targetDates) {
      const { startAt, endAt } = shiftEventDates(
        source.startAt,
        source.endAt,
        dateStr
      )

      const [cloned] = await tx
        .insert(events)
        .values({
          title: source.title,
          type: source.type,
          sectors: source.sectors,
          startAt,
          endAt,
          location: source.location,
          capacity: source.capacity,
          minVolunteers: source.minVolunteers,
          requiredTags: source.requiredTags,
          notes: source.notes,
          cancellationDeadlineHours: source.cancellationDeadlineHours,
          waitlistLimit: source.waitlistLimit,
          reminderHours: source.reminderHours,
          attendanceGracePeriodHours: source.attendanceGracePeriodHours,
          cloneSeriesId: seriesId,
          status: 'draft',
          createdBy: actorId,
        })
        .returning()

      results.push(cloned)
    }
    return results
  })

  for (const cloned of clonedEvents) {
    await createAuditEntry({
      actorId,
      actionType: 'EVENT_CREATED',
      entityType: 'event',
      entityId: cloned.id,
      afterState: {
        title: cloned.title,
        type: cloned.type,
        status: cloned.status,
        startAt: cloned.startAt.toISOString(),
        endAt: cloned.endAt.toISOString(),
        clonedFrom: sourceEventId,
        cloneSeriesId: seriesId,
      },
    })
  }

  revalidateEventPaths()
  return { eventIds: clonedEvents.map((e) => e.id) }
}

// ─── updateSeriesEvents ───────────────────────────────

export async function updateSeriesEvents(
  eventId: string,
  scope: 'single' | 'future' | 'all',
  data: unknown
) {
  const actorId = await requireAdmin()

  if (scope === 'single') {
    return updateEvent(eventId, data)
  }

  const parsed = eventSeriesUpdateSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const currentEvent = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  if (!currentEvent[0]) {
    throw new Error('Evento non trovato')
  }

  if (!currentEvent[0].cloneSeriesId) {
    throw new Error('Questo evento non fa parte di una serie')
  }

  await checkCategoryAuthorization(actorId, currentEvent[0].sectors?.[0] ?? null)
  await checkCategoryAuthorization(actorId, parsed.data.category ?? null)

  const conditions = [eq(events.cloneSeriesId, currentEvent[0].cloneSeriesId)]
  if (scope === 'future') {
    conditions.push(gte(events.startAt, currentEvent[0].startAt))
  }

  const eventsToUpdate = await db
    .select()
    .from(events)
    .where(and(...conditions))

  if (eventsToUpdate.length === 0) {
    return
  }

  const updateData = {
    title: parsed.data.title,
    type: parsed.data.type,
    sectors: parsed.data.category ? [parsed.data.category] : null,
    location: parsed.data.location,
    capacity: parsed.data.capacity,
    minVolunteers: parsed.data.minVolunteers ?? null,
    requiredTags: parsed.data.requiredTags ?? null,
    notes: parsed.data.notes ?? null,
    cancellationDeadlineHours: parsed.data.cancellationDeadlineHours ?? null,
    waitlistLimit: parsed.data.waitlistLimit ?? null,
    reminderHours: parsed.data.reminderHours ?? null,
    attendanceGracePeriodHours: parsed.data.attendanceGracePeriodHours ?? null,
    updatedAt: new Date(),
  }

  const eventIds = eventsToUpdate.map((e) => e.id)

  await db
    .update(events)
    .set(updateData)
    .where(inArray(events.id, eventIds))

  for (const evt of eventsToUpdate) {
    await createAuditEntry({
      actorId,
      actionType: 'EVENT_UPDATED',
      entityType: 'event',
      entityId: evt.id,
      beforeState: {
        title: evt.title,
        type: evt.type,
        location: evt.location,
        capacity: evt.capacity,
      },
      afterState: {
        title: parsed.data.title,
        type: parsed.data.type,
        location: parsed.data.location,
        capacity: parsed.data.capacity,
      },
    })

    // Send event-modified emails for published events in the series (fire-and-forget)
    if (evt.status === 'published') {
      getVolunteersForEvent(evt.id).then((volunteers) => {
        for (const vol of volunteers) {
          sendEventModifiedEmail({
            email: vol.email,
            firstName: vol.firstName || 'Volontario',
            eventTitle: parsed.data.title,
            changesSummary: 'Evento aggiornato come parte di una serie',
            eventId: evt.id,
          })
        }
      }).catch((error) => {
        console.error('Errore invio email modifica serie evento:', error)
      })
    }
  }

  revalidateEventPaths()
}
