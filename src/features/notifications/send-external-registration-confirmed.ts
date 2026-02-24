import 'server-only'
import ExternalRegistrationConfirmedEmail from '@/emails/external-registration-confirmed'
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
  cancelToken: string
}

export async function sendExternalRegistrationConfirmedEmail({
  email,
  firstName,
  eventTitle,
  startAt,
  location,
  cancelToken,
}: Params) {
  try {
    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Iscrizione confermata: ${eventTitle}`,
      react: ExternalRegistrationConfirmedEmail({
        firstName,
        eventTitle,
        eventDate: formatEventDate(startAt),
        eventTime: formatEventTime(startAt),
        eventLocation: location || 'Da definire',
        cancelUrl: `${getAppUrl()}/api/external-registrations/${cancelToken}/cancel`,
      }),
    })
  } catch (error) {
    console.error('Errore invio email conferma iscrizione esterna:', error)
  }
}
