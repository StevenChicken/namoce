import { CalendarDays } from 'lucide-react'
import { getPublishedEventsWithCounts } from '@/features/events/queries'
import { getUserRegistrations } from '@/features/registrations/queries'
import { requireAuthenticated } from '@/lib/auth'
import { CalendarView } from '@/components/events/calendar-view'
import type { UserRegistration } from '@/components/events/event-card'

export const metadata = {
  title: 'Calendario eventi — Namo',
}

export default async function CalendarioPage() {
  const userId = await requireAuthenticated()

  const [events, registrations] = await Promise.all([
    getPublishedEventsWithCounts(),
    getUserRegistrations(userId),
  ])

  // Build a Map<eventId, UserRegistration> for the calendar view
  const userRegistrations = new Map<string, UserRegistration>()
  for (const reg of registrations) {
    // Only include the most relevant registration per event (active ones)
    if (reg.status === 'confirmed' || reg.status === 'waitlist') {
      userRegistrations.set(reg.eventId, {
        id: reg.id,
        status: reg.status,
      })
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-namo-cyan/10">
            <CalendarDays className="h-5 w-5 text-namo-cyan" />
          </div>
          <h1 className="text-2xl font-bold text-namo-charcoal">
            Calendario eventi
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Scopri i prossimi eventi e iscriviti
        </p>
      </div>

      <CalendarView events={events} userRegistrations={userRegistrations} />
    </div>
  )
}
