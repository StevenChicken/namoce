import { NextResponse } from 'next/server'
import { requireAuthenticated } from '@/lib/auth'
import { getUpcomingUserRegistrations } from '@/features/registrations/queries'

function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export async function GET() {
  let userId: string
  try {
    userId = await requireAuthenticated()
  } catch {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const registrations = await getUpcomingUserRegistrations(userId)

  const now = formatICalDate(new Date())
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Namo APS//Namo//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Namo - I miei eventi',
  ]

  for (const reg of registrations) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${reg.eventId}@namo.app`)
    lines.push(`DTSTAMP:${now}`)
    lines.push(`DTSTART:${formatICalDate(reg.eventStartAt)}`)
    lines.push(`DTEND:${formatICalDate(reg.eventEndAt)}`)
    lines.push(`SUMMARY:${escapeICalText(reg.eventTitle)}`)
    if (reg.eventLocation) {
      lines.push(`LOCATION:${escapeICalText(reg.eventLocation)}`)
    }
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  const ics = lines.join('\r\n')

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="namo-eventi.ics"',
    },
  })
}
