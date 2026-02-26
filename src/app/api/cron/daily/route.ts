import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { events } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getUpcomingEventReminders, getVolunteersForEvent } from '@/features/notifications/queries'
import { sendEventReminderEmail } from '@/features/notifications/send-event-reminder'
import {
  getMembershipSettings,
  getUnpaidVolunteersForReminder,
} from '@/features/payments/queries'
import { sendMembershipReminder } from '@/features/notifications/send-membership-reminder'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const results: {
    eventReminders: { eventsProcessed: number; remindersSent: number }
    membershipReminders?: { remindersSent: number; skipped?: string }
  } = {
    eventReminders: { eventsProcessed: 0, remindersSent: 0 },
  }

  // --- Task 1: Event reminders (runs every day) ---
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

    results.eventReminders = {
      eventsProcessed: eventsToRemind.length,
      remindersSent: totalSent,
    }
  } catch (error) {
    console.error('Errore cron promemoria eventi:', error)
  }

  // --- Task 2: Membership reminders (runs only on Mondays) ---
  const today = new Date()
  const isMonday = today.getUTCDay() === 1

  if (isMonday) {
    try {
      const settings = await getMembershipSettings()
      const currentYear = today.getFullYear()

      const deadlineDate = new Date(
        currentYear,
        settings.deadlineMonth - 1,
        settings.deadlineDay
      )

      if (today < deadlineDate) {
        results.membershipReminders = {
          remindersSent: 0,
          skipped: 'La scadenza non è ancora passata',
        }
      } else {
        const unpaidVolunteers = await getUnpaidVolunteersForReminder(currentYear)
        let totalSent = 0

        for (const vol of unpaidVolunteers) {
          sendMembershipReminder({
            email: vol.email,
            firstName: vol.firstName || 'Volontario',
            periodYear: currentYear,
            amountCents: settings.amountCents,
          })
          totalSent++
        }

        results.membershipReminders = { remindersSent: totalSent }
      }
    } catch (error) {
      console.error('Errore cron promemoria quota:', error)
    }
  }

  return NextResponse.json({ success: true, isMonday, ...results })
}
