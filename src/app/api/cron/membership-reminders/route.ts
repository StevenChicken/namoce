import { NextRequest, NextResponse } from 'next/server'
import {
  getMembershipSettings,
  getUnpaidVolunteersForReminder,
} from '@/features/payments/queries'
import { sendMembershipReminder } from '@/features/notifications/send-membership-reminder'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  try {
    const settings = await getMembershipSettings()
    const now = new Date()
    const currentYear = now.getFullYear()

    // Only send reminders after the deadline has passed
    const deadlineDate = new Date(
      currentYear,
      settings.deadlineMonth - 1,
      settings.deadlineDay
    )

    if (now < deadlineDate) {
      return NextResponse.json({
        success: true,
        message: 'La scadenza non è ancora passata',
        remindersSent: 0,
      })
    }

    const unpaidVolunteers = await getUnpaidVolunteersForReminder(currentYear)
    let totalSent = 0

    for (const vol of unpaidVolunteers) {
      sendMembershipReminder({
        email: vol.email,
        firstName: vol.firstName || 'Volontario',
        periodYear: currentYear,
        amountCents: settings.amountCents,
      })
      totalSent++
    }

    return NextResponse.json({
      success: true,
      remindersSent: totalSent,
    })
  } catch (error) {
    console.error('Errore cron promemoria quota:', error)
    return NextResponse.json(
      { error: 'Errore interno' },
      { status: 500 }
    )
  }
}
