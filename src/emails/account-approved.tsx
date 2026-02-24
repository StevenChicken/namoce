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

interface AccountApprovedEmailProps {
  firstName: string
  loginUrl: string
}

export default function AccountApprovedEmail({
  firstName = 'Volontario',
  loginUrl = 'https://namo.vercel.app/accedi',
}: AccountApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Il tuo account Namo è stato approvato</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Benvenuto in Namo!</Heading>
          <Text style={text}>Ciao {firstName},</Text>
          <Text style={text}>
            Il tuo account è stato approvato da un amministratore. Ora puoi accedere alla piattaforma e iscriverti agli eventi.
          </Text>
          <Section style={buttonSection}>
            <Button style={button} href={loginUrl}>
              Accedi a Namo
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Questa email è stata inviata automaticamente da Namo APS. Se non hai richiesto la registrazione, puoi ignorare questo messaggio.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, Arial, Helvetica, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
}

const heading = {
  fontSize: '24px',
  fontWeight: '700' as const,
  color: '#32373c',
  marginBottom: '24px',
}

const text = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#32373c',
  marginBottom: '16px',
}

const buttonSection = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#0693e3',
  color: '#ffffff',
  borderRadius: '9999px',
  fontSize: '16px',
  fontWeight: '600' as const,
  padding: '12px 32px',
  textDecoration: 'none',
}

const hr = {
  borderColor: '#e2e8f0',
  marginTop: '32px',
  marginBottom: '16px',
}

const footer = {
  fontSize: '13px',
  color: '#abb8c3',
  lineHeight: '1.5',
}
