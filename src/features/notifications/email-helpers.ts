import { Resend } from 'resend'

// Lazy-init Resend client (mandatory — instantiating at module scope breaks build without API key)
let resendClient: Resend | null = null
export function getResendClient() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

// Shared email from address
export const EMAIL_FROM = 'Namo APS <noreply@namo.app>'

// Get the app URL
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://namo.vercel.app'
}

// Format date in Italian: "lunedì 10 marzo 2026"
export function formatEventDate(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Format time: "14:30"
export function formatEventTime(date: Date): string {
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Shared email styles — Namo design tokens
export const emailStyles = {
  main: {
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, Arial, Helvetica, sans-serif',
  },
  container: {
    margin: '0 auto',
    padding: '40px 20px',
    maxWidth: '560px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '700' as const,
    color: '#32373c',
    marginBottom: '24px',
  },
  text: {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#32373c',
    marginBottom: '16px',
  },
  buttonSection: {
    textAlign: 'center' as const,
    marginTop: '32px',
    marginBottom: '32px',
  },
  button: {
    backgroundColor: '#0693e3',
    color: '#ffffff',
    borderRadius: '9999px',
    fontSize: '16px',
    fontWeight: '600' as const,
    padding: '12px 32px',
    textDecoration: 'none',
  },
  hr: {
    borderColor: '#e2e8f0',
    marginTop: '32px',
    marginBottom: '16px',
  },
  footer: {
    fontSize: '13px',
    color: '#abb8c3',
    lineHeight: '1.5',
  },
  detailLabel: {
    fontSize: '14px',
    fontWeight: '600' as const,
    color: '#abb8c3',
    marginBottom: '4px',
  },
  detailValue: {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#32373c',
    marginBottom: '16px',
  },
} as const
