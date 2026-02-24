import 'server-only'
import EventModifiedEmail from '@/emails/event-modified'
import {
  getResendClient,
  EMAIL_FROM,
  getAppUrl,
} from './email-helpers'

interface Params {
  email: string
  firstName: string
  eventTitle: string
  changesSummary: string
  eventId: string
}

export async function sendEventModifiedEmail({
  email,
  firstName,
  eventTitle,
  changesSummary,
  eventId,
}: Params) {
  try {
    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Evento modificato: ${eventTitle}`,
      react: EventModifiedEmail({
        firstName,
        eventTitle,
        changesSummary,
        eventUrl: `${getAppUrl()}/calendario/${eventId}`,
      }),
    })
  } catch (error) {
    console.error('Errore invio email evento modificato:', error)
  }
}
