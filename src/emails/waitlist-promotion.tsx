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

interface WaitlistPromotionEmailProps {
  firstName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  refuseUrl: string
}

export default function WaitlistPromotionEmail({
  firstName = 'Volontario',
  eventTitle = 'Evento di esempio',
  eventDate = 'Lunedì 10 marzo 2026',
  eventTime = '14:30',
  eventLocation = 'Sede Namo APS',
  refuseUrl = 'https://namo.vercel.app',
}: WaitlistPromotionEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Posto disponibile per {eventTitle}</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.heading}>
            Si è liberato un posto!
          </Heading>
          <Text style={emailStyles.text}>Ciao {firstName},</Text>
          <Text style={emailStyles.text}>
            Si è liberato un posto per l&apos;evento{' '}
            <strong>{eventTitle}</strong> e la tua iscrizione è stata
            confermata automaticamente dalla lista d&apos;attesa.
          </Text>
          <Text style={emailStyles.detailLabel}>Data</Text>
          <Text style={emailStyles.detailValue}>{eventDate}</Text>
          <Text style={emailStyles.detailLabel}>Orario</Text>
          <Text style={emailStyles.detailValue}>{eventTime}</Text>
          <Text style={emailStyles.detailLabel}>Luogo</Text>
          <Text style={emailStyles.detailValue}>{eventLocation}</Text>
          <Section style={emailStyles.buttonSection}>
            <Button style={emailStyles.button} href={refuseUrl}>
              Non posso partecipare
            </Button>
          </Section>
          <Text style={{ ...emailStyles.text, fontSize: '14px' }}>
            Se non puoi partecipare,{' '}
            <Link href={refuseUrl} style={{ color: '#0693e3' }}>
              clicca qui per rinunciare al posto
            </Link>
            . Il posto verrà assegnato al prossimo volontario in lista
            d&apos;attesa.
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
