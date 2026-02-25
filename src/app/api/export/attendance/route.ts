import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth'
import { getAttendanceExportData } from '@/features/export/queries'

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

function translateAttendance(status: string): string {
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

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin()
  } catch {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const startDateStr = searchParams.get('startDate')
  const endDateStr = searchParams.get('endDate')

  if (!startDateStr || !endDateStr) {
    return NextResponse.json(
      { error: 'Parametri startDate e endDate richiesti' },
      { status: 400 }
    )
  }

  const startDate = new Date(startDateStr)
  const endDate = new Date(endDateStr)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json(
      { error: 'Formato data non valido' },
      { status: 400 }
    )
  }

  const rows = await getAttendanceExportData({ startDate, endDate })

  const header = 'Evento,Data,Categoria,Volontario,Email,Stato Presenza'
  const csvRows = rows.map((row) => {
    const name = [row.volunteerFirstName, row.volunteerLastName]
      .filter(Boolean)
      .join(' ')
    const category = row.eventSectors?.[0] ?? ''
    return [
      escapeCSV(row.eventTitle),
      escapeCSV(formatDate(row.eventStartAt)),
      escapeCSV(category),
      escapeCSV(name),
      escapeCSV(row.volunteerEmail),
      escapeCSV(translateAttendance(row.attendanceStatus!)),
    ].join(',')
  })

  const csv = '\uFEFF' + [header, ...csvRows].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="presenze.csv"',
    },
  })
}
