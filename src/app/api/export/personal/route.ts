import { NextResponse } from 'next/server'
import { requireAuthenticated } from '@/lib/auth'
import { getPersonalExportData } from '@/features/export/queries'

function escapeCSV(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function translateStatus(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'Confermata'
    case 'waitlist':
      return 'Lista d\'attesa'
    case 'cancelled':
      return 'Cancellata'
    default:
      return status
  }
}

function translateAttendance(status: string | null): string {
  if (!status) return ''
  switch (status) {
    case 'present':
      return 'Presente'
    case 'absent':
      return 'Assente'
    case 'no_show':
      return 'Non presentato'
    default:
      return status
  }
}

export async function GET() {
  let userId: string
  try {
    userId = await requireAuthenticated()
  } catch {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const data = await getPersonalExportData(userId)

  if (!data.user) {
    return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
  }

  const lines: string[] = []

  // User info section
  lines.push('--- I MIEI DATI ---')
  lines.push(`Nome,${escapeCSV([data.user.firstName, data.user.lastName].filter(Boolean).join(' '))}`)
  lines.push(`Email,${escapeCSV(data.user.email)}`)
  lines.push(`Tipo,${data.user.userType === 'volontario' ? 'Volontario' : 'Utente'}`)
  lines.push(`Admin,${data.user.adminLevel === 'super_admin' ? 'Super Admin' : data.user.adminLevel === 'admin' ? 'Admin' : 'No'}`)
  lines.push(`Stato,${data.user.status}`)
  lines.push(`Iscritto dal,${formatDate(data.user.createdAt)}`)
  lines.push('')

  // Registrations section
  lines.push('--- LE MIE ISCRIZIONI ---')
  lines.push('Evento,Tipo,Data Inizio,Data Fine,Luogo,Stato Iscrizione,Data Iscrizione,Data Cancellazione,Stato Presenza')

  for (const reg of data.registrations) {
    lines.push(
      [
        escapeCSV(reg.eventTitle),
        reg.eventType === 'interno' ? 'Interno' : 'Aperto',
        escapeCSV(formatDateTime(reg.eventStartAt)),
        escapeCSV(formatDateTime(reg.eventEndAt)),
        escapeCSV(reg.eventLocation ?? ''),
        translateStatus(reg.registrationStatus),
        escapeCSV(formatDateTime(reg.registeredAt)),
        reg.cancelledAt ? escapeCSV(formatDateTime(reg.cancelledAt)) : '',
        translateAttendance(reg.attendanceStatus),
      ].join(',')
    )
  }

  const csv = '\uFEFF' + lines.join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="i-miei-dati.csv"',
    },
  })
}
