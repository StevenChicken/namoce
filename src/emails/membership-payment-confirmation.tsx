import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components'
import { emailStyles } from '@/features/notifications/email-helpers'

interface MembershipPaymentConfirmationEmailProps {
  firstName: string
  periodYear: number
  amount: string
}

export default function MembershipPaymentConfirmationEmail({
  firstName = 'Volontario',
  periodYear = 2026,
  amount = '35,00',
}: MembershipPaymentConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Pagamento quota associativa confermato</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.heading}>Pagamento confermato</Heading>
          <Text style={emailStyles.text}>Ciao {firstName},</Text>
          <Text style={emailStyles.text}>
            Il tuo pagamento della quota associativa per l&apos;anno{' '}
            <strong>{periodYear}</strong> è stato ricevuto con successo.
          </Text>
          <Text style={emailStyles.detailLabel}>Importo</Text>
          <Text style={emailStyles.detailValue}>EUR {amount}</Text>
          <Text style={emailStyles.detailLabel}>Periodo</Text>
          <Text style={emailStyles.detailValue}>Anno {periodYear}</Text>
          <Text style={emailStyles.text}>
            Grazie per il tuo sostegno a Namo APS! La tua quota è fondamentale
            per le nostre attività di volontariato.
          </Text>
          <Hr style={emailStyles.hr} />
          <Text style={emailStyles.footer}>
            Questa email è stata inviata automaticamente da Namo APS. Per
            qualsiasi domanda, contatta i responsabili dell&apos;associazione.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
