import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { registrations, events } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { verifyRefuseToken } from '@/features/notifications/token-helpers'
import { createAuditEntry } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  const { registrationId } = await params
  const token = request.nextUrl.searchParams.get('token')

  if (!token || !verifyRefuseToken(registrationId, token)) {
    return new NextResponse(htmlPage('Link non valido', 'Il link per rinunciare al posto non è valido o è scaduto.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const reg = await db
    .select({
      id: registrations.id,
      status: registrations.status,
      userId: registrations.userId,
      eventId: registrations.eventId,
    })
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .limit(1)

  if (!reg[0]) {
    return new NextResponse(htmlPage('Iscrizione non trovata', 'Non è stata trovata nessuna iscrizione associata a questo link.'), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  if (reg[0].status === 'cancelled') {
    return new NextResponse(htmlPage('Iscrizione già annullata', 'Hai già rinunciato al posto per questo evento.'), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  if (reg[0].status !== 'confirmed') {
    return new NextResponse(htmlPage('Operazione non disponibile', 'Questa iscrizione non può essere annullata in questo momento.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // Cancel the registration
  await db
    .update(registrations)
    .set({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationType: 'normal',
      updatedAt: new Date(),
    })
    .where(eq(registrations.id, registrationId))

  // Audit log
  await createAuditEntry({
    actorId: reg[0].userId,
    actionType: 'WAITLIST_PROMOTION_DECLINED',
    entityType: 'registration',
    entityId: registrationId,
    beforeState: { status: 'confirmed' },
    afterState: { status: 'cancelled', reason: 'promotion_refused' },
  })

  // Promote next in waitlist
  const { promoteFromWaitlist } = await import('@/features/registrations/actions')
  await promoteFromWaitlist(reg[0].eventId)

  // Get event title for the response
  const eventResult = await db
    .select({ title: events.title })
    .from(events)
    .where(eq(events.id, reg[0].eventId))
    .limit(1)

  const eventTitle = eventResult[0]?.title || 'l\'evento'

  return new NextResponse(
    htmlPage(
      'Rinuncia confermata',
      `Hai rinunciato al posto per <strong>${eventTitle}</strong>. Il posto verrà assegnato al prossimo volontario in lista d'attesa.`
    ),
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Namo APS</title>
  <style>
    body { font-family: Inter, Arial, Helvetica, sans-serif; margin: 0; padding: 40px 20px; background: #ffffff; color: #32373c; }
    .container { max-width: 560px; margin: 0 auto; text-align: center; }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 16px; }
    p { font-size: 16px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`
}
