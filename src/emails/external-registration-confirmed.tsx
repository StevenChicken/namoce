import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { emailStyles } from '@/features/notifications/email-helpers'

interface ExternalRegistrationConfirmedEmailProps {
  firstName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  cancelUrl: string
}

export default function ExternalRegistrationConfirmedEmail({
  firstName = 'Partecipante',
  eventTitle = 'Evento di esempio',
  eventDate = 'Lunedì 10 marzo 2026',
  eventTime = '14:30',
  eventLocation = 'Sede Namo APS',
  cancelUrl = 'https://namo.vercel.app',
}: ExternalRegistrationConfirmedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Iscrizione confermata per {eventTitle}</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.heading}>Iscrizione confermata</Heading>
          <Text style={emailStyles.text}>Ciao {firstName},</Text>
          <Text style={emailStyles.text}>
            La tua iscrizione all&apos;evento <strong>{eventTitle}</strong> è
            stata confermata.
          </Text>
          <Text style={emailStyles.detailLabel}>Data</Text>
          <Text style={emailStyles.detailValue}>{eventDate}</Text>
          <Text style={emailStyles.detailLabel}>Orario</Text>
          <Text style={emailStyles.detailValue}>{eventTime}</Text>
          <Text style={emailStyles.detailLabel}>Luogo</Text>
          <Text style={emailStyles.detailValue}>{eventLocation}</Text>
          <Section style={emailStyles.buttonSection}>
            <Button style={emailStyles.button} href={cancelUrl}>
              Annulla iscrizione
            </Button>
          </Section>
          <Text style={{ ...emailStyles.text, fontSize: '14px' }}>
            Se hai bisogno di annullare la tua iscrizione, puoi farlo in
            qualsiasi momento cliccando il pulsante sopra o visitando{' '}
            <Link href={cancelUrl} style={{ color: '#0693e3' }}>
              questo link
            </Link>
            .
          </Text>
          <Hr style={emailStyles.hr} />
          <Text style={emailStyles.footer}>
            Questa email è stata inviata automaticamente da Namo APS.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
