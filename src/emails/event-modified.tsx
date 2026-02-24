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

interface EventModifiedEmailProps {
  firstName: string
  eventTitle: string
  changesSummary: string
  eventUrl: string
}

export default function EventModifiedEmail({
  firstName = 'Volontario',
  eventTitle = 'Evento di esempio',
  changesSummary = 'Data e luogo aggiornati',
  eventUrl = 'https://namo.vercel.app/calendario/123',
}: EventModifiedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Evento modificato: {eventTitle}</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.heading}>Evento modificato</Heading>
          <Text style={emailStyles.text}>Ciao {firstName},</Text>
          <Text style={emailStyles.text}>
            L&apos;evento <strong>{eventTitle}</strong> a cui sei iscritto è
            stato modificato.
          </Text>
          <Text style={emailStyles.detailLabel}>Modifiche</Text>
          <Text style={emailStyles.detailValue}>{changesSummary}</Text>
          <Section style={emailStyles.buttonSection}>
            <Button style={emailStyles.button} href={eventUrl}>
              Vedi dettagli evento
            </Button>
          </Section>
          <Hr style={emailStyles.hr} />
          <Text style={emailStyles.footer}>
            Questa email è stata inviata automaticamente da Namo APS. Se
            desideri annullare la tua iscrizione a seguito delle modifiche, puoi
            farlo dalla piattaforma.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
