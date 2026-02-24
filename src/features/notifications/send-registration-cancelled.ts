import 'server-only'
import RegistrationCancelledEmail from '@/emails/registration-cancelled'
import {
  getResendClient,
  EMAIL_FROM,
  formatEventDate,
} from './email-helpers'

interface Params {
  email: string
  firstName: string
  eventTitle: string
  startAt: Date
  cancelledBy: 'self' | 'admin'
}

export async function sendRegistrationCancelledEmail({
  email,
  firstName,
  eventTitle,
  startAt,
  cancelledBy,
}: Params) {
  try {
    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Iscrizione annullata: ${eventTitle}`,
      react: RegistrationCancelledEmail({
        firstName,
        eventTitle,
        eventDate: formatEventDate(startAt),
        cancelledBy,
      }),
    })
  } catch (error) {
    console.error('Errore invio email cancellazione iscrizione:', error)
  }
}
