import 'server-only'
import PromotedToVolontarioEmail from '@/emails/promoted-to-volontario'
import { getResendClient, EMAIL_FROM, getAppUrl } from './email-helpers'

interface Params {
  email: string
  firstName: string
}

export async function sendPromotedToVolontario({ email, firstName }: Params) {
  try {
    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Sei diventato volontario di Namo!',
      react: PromotedToVolontarioEmail({
        firstName,
        calendarUrl: `${getAppUrl()}/calendario_del_volontario`,
      }),
    })
  } catch (error) {
    console.error('Errore invio email promozione volontario:', error)
  }
}
