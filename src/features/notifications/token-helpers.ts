import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'
import { getAppUrl } from './email-helpers'

function getSecret(): string {
  return (
    process.env.HMAC_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'fallback-dev-secret'
  )
}

export function generateRefuseToken(registrationId: string): string {
  return createHmac('sha256', getSecret())
    .update(registrationId)
    .digest('hex')
}

export function verifyRefuseToken(
  registrationId: string,
  token: string
): boolean {
  const expected = generateRefuseToken(registrationId)
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token))
  } catch {
    return false
  }
}

export function buildRefuseUrl(registrationId: string): string {
  const token = generateRefuseToken(registrationId)
  return `${getAppUrl()}/api/registrations/${registrationId}/refuse-promotion?token=${token}`
}
