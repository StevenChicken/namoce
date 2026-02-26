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

interface DonationThankYouEmailProps {
  firstName?: string
  amount: string
}

export default function DonationThankYouEmail({
  firstName,
  amount = '25,00',
}: DonationThankYouEmailProps) {
  const greeting = firstName ? `Ciao ${firstName},` : 'Gentile donatore,'

  return (
    <Html>
      <Head />
      <Preview>Grazie per la tua donazione a Namo APS</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Heading style={emailStyles.heading}>
            Grazie per la tua donazione!
          </Heading>
          <Text style={emailStyles.text}>{greeting}</Text>
          <Text style={emailStyles.text}>
            Abbiamo ricevuto la tua donazione di <strong>EUR {amount}</strong> a
            favore di Namo APS.
          </Text>
          <Text style={emailStyles.text}>
            Il tuo contributo è prezioso e ci permette di continuare le nostre
            attività di volontariato a sostegno della comunità. Ogni donazione
            fa la differenza!
          </Text>
          <Text style={emailStyles.text}>
            Grazie di cuore per il tuo generoso supporto.
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
