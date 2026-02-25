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

interface PromotedToVolontarioEmailProps {
  firstName: string
  calendarUrl: string
}

export default function PromotedToVolontarioEmail({
  firstName = 'Utente',
  calendarUrl = 'https://namo.vercel.app/calendario_del_volontario',
}: PromotedToVolontarioEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Sei diventato volontario di Namo!</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.heading}>
            Sei diventato volontario!
          </Heading>
          <Text style={emailStyles.text}>Ciao {firstName},</Text>
          <Text style={emailStyles.text}>
            Un amministratore ti ha promosso a volontario. Ora puoi accedere al
            calendario del volontario e iscriverti agli eventi interni.
          </Text>
          <Section style={emailStyles.buttonSection}>
            <Button style={emailStyles.button} href={calendarUrl}>
              Vai al calendario
            </Button>
          </Section>
          <Hr style={emailStyles.hr} />
          <Text style={emailStyles.footer}>
            Questa email è stata inviata automaticamente da Namo APS.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
