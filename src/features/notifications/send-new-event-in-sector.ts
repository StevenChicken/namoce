import 'server-only'
import NewEventInSectorEmail from '@/emails/new-event-in-sector'
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
  sectors: string[]
  eventId: string
}

export async function sendNewEventInSectorEmail({
  email,
  firstName,
  eventTitle,
  startAt,
  location,
  sectors,
  eventId,
}: Params) {
  try {
    const appUrl = getAppUrl()
    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Nuovo evento: ${eventTitle}`,
      react: NewEventInSectorEmail({
        firstName,
        eventTitle,
        eventDate: formatEventDate(startAt),
        eventTime: formatEventTime(startAt),
        eventLocation: location || 'Da definire',
        sectors,
        eventUrl: `${appUrl}/calendario/${eventId}`,
        unsubscribeUrl: `${appUrl}/profilo`,
      }),
    })
  } catch (error) {
    console.error('Errore invio email nuovo evento settore:', error)
  }
}
