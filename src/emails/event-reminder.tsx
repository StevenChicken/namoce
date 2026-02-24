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

interface EventReminderEmailProps {
  firstName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  calendarUrl: string
}

export default function EventReminderEmail({
  firstName = 'Volontario',
  eventTitle = 'Evento di esempio',
  eventDate = 'Lunedì 10 marzo 2026',
  eventTime = '14:30',
  eventLocation = 'Sede Namo APS',
  calendarUrl = 'https://namo.vercel.app/calendario',
}: EventReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Promemoria: {eventTitle}</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.heading}>Promemoria evento</Heading>
          <Text style={emailStyles.text}>Ciao {firstName},</Text>
          <Text style={emailStyles.text}>
            Ti ricordiamo che sei iscritto all&apos;evento{' '}
            <strong>{eventTitle}</strong>.
          </Text>
          <Text style={emailStyles.detailLabel}>Data</Text>
          <Text style={emailStyles.detailValue}>{eventDate}</Text>
          <Text style={emailStyles.detailLabel}>Orario</Text>
          <Text style={emailStyles.detailValue}>{eventTime}</Text>
          <Text style={emailStyles.detailLabel}>Luogo</Text>
          <Text style={emailStyles.detailValue}>{eventLocation}</Text>
          <Section style={emailStyles.buttonSection}>
            <Button style={emailStyles.button} href={calendarUrl}>
              Vedi nel calendario
            </Button>
          </Section>
          <Hr style={emailStyles.hr} />
          <Text style={emailStyles.footer}>
            Questa email è stata inviata automaticamente da Namo APS. Se hai
            bisogno di annullare la tua iscrizione, puoi farlo dalla
            piattaforma.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
