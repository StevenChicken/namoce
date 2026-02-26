import 'server-only'
import MembershipReminderEmail from '@/emails/membership-reminder'
import { getResendClient, EMAIL_FROM, getAppUrl } from './email-helpers'

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

interface Params {
  email: string
  firstName: string
  periodYear: number
  amountCents: number
}

export async function sendMembershipReminder({
  email,
  firstName,
  periodYear,
  amountCents,
}: Params) {
  try {
    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: `Promemoria: quota associativa ${periodYear}`,
      react: MembershipReminderEmail({
        firstName,
        periodYear,
        amount: formatCents(amountCents),
        paymentUrl: `${getAppUrl()}/profilo`,
      }),
    })
  } catch (error) {
    console.error('Errore invio email promemoria quota:', error)
  }
}
