import 'server-only'
import WelcomeEmail from '@/emails/welcome'
import { getResendClient, EMAIL_FROM, getAppUrl } from './email-helpers'

interface Params {
  email: string
  firstName: string
}

export async function sendWelcome({ email, firstName }: Params) {
  try {
    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Benvenuto in Namo!',
      react: WelcomeEmail({
        firstName,
        calendarUrl: `${getAppUrl()}/calendario_eventi`,
      }),
    })
  } catch (error) {
    console.error('Errore invio email benvenuto:', error)
  }
}
