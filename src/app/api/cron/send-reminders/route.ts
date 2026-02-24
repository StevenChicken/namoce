import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { events } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getUpcomingEventReminders, getVolunteersForEvent } from '@/features/notifications/queries'
import { sendEventReminderEmail } from '@/features/notifications/send-event-reminder'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  try {
    const eventsToRemind = await getUpcomingEventReminders()
    let totalSent = 0

    for (const event of eventsToRemind) {
      const volunteers = await getVolunteersForEvent(event.id)

      for (const vol of volunteers) {
        sendEventReminderEmail({
          email: vol.email,
          firstName: vol.firstName || 'Volontario',
          eventTitle: event.title,
          startAt: event.startAt,
          location: event.location,
        })
        totalSent++
      }

      await db
        .update(events)
        .set({ reminderSentAt: new Date() })
        .where(eq(events.id, event.id))
    }

    return NextResponse.json({
      success: true,
      eventsProcessed: eventsToRemind.length,
      remindersSent: totalSent,
    })
  } catch (error) {
    console.error('Errore cron promemoria:', error)
    return NextResponse.json(
      { error: 'Errore interno' },
      { status: 500 }
    )
  }
}
