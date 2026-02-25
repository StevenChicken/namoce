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

interface WelcomeEmailProps {
  firstName: string
  calendarUrl: string
}

export default function WelcomeEmail({
  firstName = 'Utente',
  calendarUrl = 'https://namo.vercel.app/calendario_eventi',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Benvenuto in Namo!</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.heading}>Benvenuto in Namo!</Heading>
          <Text style={emailStyles.text}>Ciao {firstName},</Text>
          <Text style={emailStyles.text}>
            Il tuo account è stato creato con successo. Puoi esplorare gli
            eventi pubblici e iscriverti direttamente dalla piattaforma.
          </Text>
          <Section style={emailStyles.buttonSection}>
            <Button style={emailStyles.button} href={calendarUrl}>
              Esplora gli eventi
            </Button>
          </Section>
          <Hr style={emailStyles.hr} />
          <Text style={emailStyles.footer}>
            Questa email è stata inviata automaticamente da Namo APS. Se non
            hai richiesto la registrazione, puoi ignorare questo messaggio.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
