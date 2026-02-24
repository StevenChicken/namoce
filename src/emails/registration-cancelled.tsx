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

interface RegistrationCancelledEmailProps {
  firstName: string
  eventTitle: string
  eventDate: string
  cancelledBy: 'self' | 'admin'
}

export default function RegistrationCancelledEmail({
  firstName = 'Volontario',
  eventTitle = 'Evento di esempio',
  eventDate = 'Lunedì 10 marzo 2026',
  cancelledBy = 'self',
}: RegistrationCancelledEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Iscrizione annullata per {eventTitle}</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.heading}>Iscrizione annullata</Heading>
          <Text style={emailStyles.text}>Ciao {firstName},</Text>
          {cancelledBy === 'admin' ? (
            <Text style={emailStyles.text}>
              La tua iscrizione all&apos;evento <strong>{eventTitle}</strong> è
              stata annullata da un amministratore.
            </Text>
          ) : (
            <Text style={emailStyles.text}>
              La tua iscrizione all&apos;evento <strong>{eventTitle}</strong> è
              stata annullata con successo.
            </Text>
          )}
          <Text style={emailStyles.detailLabel}>Data evento</Text>
          <Text style={emailStyles.detailValue}>{eventDate}</Text>
          {cancelledBy === 'admin' && (
            <Text style={emailStyles.text}>
              Se ritieni che sia un errore, contatta un amministratore.
            </Text>
          )}
          <Hr style={emailStyles.hr} />
          <Text style={emailStyles.footer}>
            Questa email è stata inviata automaticamente da Namo APS.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
