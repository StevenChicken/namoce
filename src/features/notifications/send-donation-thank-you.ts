import 'server-only'
import DonationThankYouEmail from '@/emails/donation-thank-you'
import { getResendClient, EMAIL_FROM } from './email-helpers'

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

interface Params {
  email: string
  firstName?: string
  amountCents: number
}

export async function sendDonationThankYou({
  email,
  firstName,
  amountCents,
}: Params) {
  try {
    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Grazie per la tua donazione a Namo APS',
      react: DonationThankYouEmail({
        firstName,
        amount: formatCents(amountCents),
      }),
    })
  } catch (error) {
    console.error('Errore invio email ringraziamento donazione:', error)
  }
}
