import 'server-only'
import MembershipPaymentConfirmationEmail from '@/emails/membership-payment-confirmation'
import { getResendClient, EMAIL_FROM } from './email-helpers'

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

interface Params {
  email: string
  firstName: string
  periodYear: number
  amountCents: number
}

export async function sendMembershipPaymentConfirmation({
  email,
  firstName,
  periodYear,
  amountCents,
}: Params) {
  try {
    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Pagamento quota ${periodYear} confermato`,
      react: MembershipPaymentConfirmationEmail({
        firstName,
        periodYear,
        amount: formatCents(amountCents),
      }),
    })
  } catch (error) {
    console.error('Errore invio email conferma pagamento:', error)
  }
}
