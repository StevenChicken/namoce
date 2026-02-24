import 'server-only'
import EventReminderEmail from '@/emails/event-reminder'
import {
  getResendClient,
  EMAIL_FROM,
  getAppUrl,
  formatEventDate,
  formatEventTime,
} from './email-helpers'

interface Params {
  email: string
  firstName: string
  eventTitle: string
  startAt: Date
  location: string | null
}

export async function sendEventReminderEmail({
  email,
  firstName,
  eventTitle,
  startAt,
  location,
}: Params) {
  try {
    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Promemoria: ${eventTitle}`,
      react: EventReminderEmail({
        firstName,
        eventTitle,
        eventDate: formatEventDate(startAt),
        eventTime: formatEventTime(startAt),
        eventLocation: location || 'Da definire',
        calendarUrl: `${getAppUrl()}/calendario`,
      }),
    })
  } catch (error) {
    console.error('Errore invio email promemoria evento:', error)
  }
}
