import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { emailStyles } from '@/features/notifications/email-helpers'

interface MembershipReminderEmailProps {
  firstName: string
  periodYear: number
  amount: string
  paymentUrl: string
}

export default function MembershipReminderEmail({
  firstName = 'Volontario',
  periodYear = 2026,
  amount = '35,00',
  paymentUrl = 'https://namo.vercel.app/profilo',
}: MembershipReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Promemoria: quota associativa {String(periodYear)}</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.heading}>
            Promemoria quota associativa
          </Heading>
          <Text style={emailStyles.text}>Ciao {firstName},</Text>
          <Text style={emailStyles.text}>
            Ti ricordiamo che la quota associativa per l&apos;anno{' '}
            <strong>{periodYear}</strong> non risulta ancora pagata.
          </Text>
          <Text style={emailStyles.detailLabel}>Importo dovuto</Text>
          <Text style={emailStyles.detailValue}>EUR {amount}</Text>
          <Text style={emailStyles.text}>
            Puoi effettuare il pagamento direttamente dalla tua pagina profilo
            oppure contattare i responsabili per un pagamento in contanti o
            tramite bonifico.
          </Text>
          <Section style={emailStyles.buttonSection}>
            <Button style={emailStyles.button} href={paymentUrl}>
              Paga la quota
            </Button>
          </Section>
          <Hr style={emailStyles.hr} />
          <Text style={emailStyles.footer}>
            Questa email è stata inviata automaticamente da Namo APS. Se hai già
            effettuato il pagamento, puoi ignorare questo messaggio.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
