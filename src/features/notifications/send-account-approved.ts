import 'server-only'
import AccountApprovedEmail from '@/emails/account-approved'
import { getResendClient, EMAIL_FROM, getAppUrl } from './email-helpers'

interface SendAccountApprovedParams {
  email: string
  firstName: string
}

export async function sendAccountApprovedEmail({
  email,
  firstName,
}: SendAccountApprovedParams) {
  try {
    const loginUrl = `${getAppUrl()}/accedi`

    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Il tuo account Namo è stato approvato',
      react: AccountApprovedEmail({ firstName, loginUrl }),
    })
  } catch (error) {
    console.error('Errore invio email approvazione account:', error)
  }
}
