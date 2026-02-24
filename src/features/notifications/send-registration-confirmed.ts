import 'server-only'
import RegistrationConfirmedEmail from '@/emails/registration-confirmed'
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

export async function sendRegistrationConfirmedEmail({
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
      subject: `Iscrizione confermata: ${eventTitle}`,
      react: RegistrationConfirmedEmail({
        firstName,
        eventTitle,
        eventDate: formatEventDate(startAt),
        eventTime: formatEventTime(startAt),
        eventLocation: location || 'Da definire',
        calendarUrl: `${getAppUrl()}/calendario`,
      }),
    })
  } catch (error) {
    console.error('Errore invio email conferma iscrizione:', error)
  }
}
