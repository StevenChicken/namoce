import { NextRequest, NextResponse } from 'next/server'
import { cancelExternalRegistration } from '@/features/registrations/actions'
import { getExternalRegistrationByCancelToken } from '@/features/registrations/queries'

function renderHtml(title: string, message: string, variant: 'success' | 'error' | 'warning') {
  const colors = {
    success: { bg: '#00d084', icon: '&#10003;' },
    error: { bg: '#cf2e2e', icon: '&#10007;' },
    warning: { bg: '#ff6900', icon: '!' },
  }
  const { bg, icon } = colors[variant]

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Namo APS</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', Arial, Helvetica, sans-serif;
      background: #f9fafb;
      color: #32373c;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 6px 6px 9px rgba(0,0,0,0.1);
      padding: 2.5rem 2rem;
      max-width: 440px;
      width: 100%;
      text-align: center;
    }
    .icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${bg}1a;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }
    .icon-circle span {
      color: ${bg};
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1;
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    p {
      font-size: 0.9375rem;
      color: #666;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }
    a.btn {
      display: inline-block;
      background: #32373c;
      color: #fff;
      text-decoration: none;
      padding: 0.625rem 1.5rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: opacity 0.15s;
    }
    a.btn:hover { opacity: 0.9; }
    .footer {
      margin-top: 2rem;
      font-size: 0.75rem;
      color: #abb8c3;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-circle"><span>${icon}</span></div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/eventi" class="btn">Torna agli eventi</a>
  </div>
  <p class="footer">&copy; 2026 Namo APS</p>
</body>
</html>`
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cancelToken: string }> }
) {
  const { cancelToken } = await params

  // First check if the registration exists and its current state
  const registration = await getExternalRegistrationByCancelToken(cancelToken)

  if (!registration) {
    return new NextResponse(
      renderHtml(
        'Link non valido',
        'Questo link di cancellazione non è valido o è scaduto. Se hai già annullato la tua iscrizione, non è necessaria alcuna azione.',
        'error'
      ),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  if (registration.status === 'cancelled') {
    return new NextResponse(
      renderHtml(
        'Iscrizione già annullata',
        `La tua iscrizione a <strong>${registration.eventTitle}</strong> è già stata annullata in precedenza.`,
        'warning'
      ),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  try {
    const result = await cancelExternalRegistration(cancelToken)

    return new NextResponse(
      renderHtml(
        'Iscrizione annullata',
        `La tua iscrizione a <strong>${result.eventTitle}</strong> è stata annullata con successo.`,
        'success'
      ),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto'

    return new NextResponse(
      renderHtml(
        'Errore',
        `Si è verificato un errore durante l'annullamento: ${message}`,
        'error'
      ),
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
}
