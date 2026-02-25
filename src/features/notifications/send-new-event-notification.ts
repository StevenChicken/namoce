import 'server-only'
import NewEventNotificationEmail from '@/emails/new-event-notification'
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
  category: string | null
  eventId: string
}

export async function sendNewEventNotificationEmail({
  email,
  firstName,
  eventTitle,
  startAt,
  location,
  category,
  eventId,
}: Params) {
  try {
    const appUrl = getAppUrl()
    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Nuovo evento: ${eventTitle}`,
      react: NewEventNotificationEmail({
        firstName,
        eventTitle,
        eventDate: formatEventDate(startAt),
        eventTime: formatEventTime(startAt),
        eventLocation: location || 'Da definire',
        category,
        eventUrl: `${appUrl}/calendario/${eventId}`,
        unsubscribeUrl: `${appUrl}/profilo`,
      }),
    })
  } catch (error) {
    console.error('Errore invio email nuovo evento:', error)
  }
}
