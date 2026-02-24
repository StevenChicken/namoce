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

interface NewEventInSectorEmailProps {
  firstName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  sectors: string[]
  eventUrl: string
  unsubscribeUrl: string
}

export default function NewEventInSectorEmail({
  firstName = 'Volontario',
  eventTitle = 'Evento di esempio',
  eventDate = 'Lunedì 10 marzo 2026',
  eventTime = '14:30',
  eventLocation = 'Sede Namo APS',
  sectors = ['Clown Terapia'],
  eventUrl = 'https://namo.vercel.app/calendario/123',
  unsubscribeUrl = 'https://namo.vercel.app/profilo',
}: NewEventInSectorEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nuovo evento: {eventTitle}</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.heading}>Nuovo evento disponibile</Heading>
          <Text style={emailStyles.text}>Ciao {firstName},</Text>
          <Text style={emailStyles.text}>
            È stato pubblicato un nuovo evento che potrebbe interessarti:{' '}
            <strong>{eventTitle}</strong>.
          </Text>
          <Text style={emailStyles.detailLabel}>Settori</Text>
          <Text style={emailStyles.detailValue}>{sectors.join(', ')}</Text>
          <Text style={emailStyles.detailLabel}>Data</Text>
          <Text style={emailStyles.detailValue}>{eventDate}</Text>
          <Text style={emailStyles.detailLabel}>Orario</Text>
          <Text style={emailStyles.detailValue}>{eventTime}</Text>
          <Text style={emailStyles.detailLabel}>Luogo</Text>
          <Text style={emailStyles.detailValue}>{eventLocation}</Text>
          <Section style={emailStyles.buttonSection}>
            <Button style={emailStyles.button} href={eventUrl}>
              Vedi evento e iscriviti
            </Button>
          </Section>
          <Hr style={emailStyles.hr} />
          <Text style={emailStyles.footer}>
            Ricevi questa email perché hai selezionato questi settori di
            interesse.{' '}
            <Link href={unsubscribeUrl} style={{ color: '#abb8c3' }}>
              Modifica le tue preferenze
            </Link>{' '}
            per non ricevere più queste notifiche.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
