import 'server-only'
import WaitlistPromotionEmail from '@/emails/waitlist-promotion'
import {
  getResendClient,
  EMAIL_FROM,
  formatEventDate,
  formatEventTime,
} from './email-helpers'
import { buildRefuseUrl } from './token-helpers'

interface Params {
  email: string
  firstName: string
  eventTitle: string
  startAt: Date
  location: string | null
  registrationId: string
}

export async function sendWaitlistPromotionEmail({
  email,
  firstName,
  eventTitle,
  startAt,
  location,
  registrationId,
}: Params) {
  try {
    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Posto disponibile: ${eventTitle}`,
      react: WaitlistPromotionEmail({
        firstName,
        eventTitle,
        eventDate: formatEventDate(startAt),
        eventTime: formatEventTime(startAt),
        eventLocation: location || 'Da definire',
        refuseUrl: buildRefuseUrl(registrationId),
      }),
    })
  } catch (error) {
    console.error('Errore invio email promozione waitlist:', error)
  }
}
