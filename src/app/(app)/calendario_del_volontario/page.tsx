import { CalendarHeart } from 'lucide-react'
import { getPublishedInternoEventsWithCounts } from '@/features/events/queries'
import { getUserRegistrations } from '@/features/registrations/queries'
import { requireVolunteerOrAdmin } from '@/lib/auth'
import { CalendarView } from '@/components/events/calendar-view'
import type { UserRegistration } from '@/components/events/event-card'

export const metadata = {
  title: 'Calendario del volontario — Namo',
}

export default async function CalendarioDelVolontarioPage() {
  const userId = await requireVolunteerOrAdmin()

  const [events, registrations] = await Promise.all([
    getPublishedInternoEventsWithCounts(),
    getUserRegistrations(userId),
  ])

  const userRegistrations = new Map<string, UserRegistration>()
  for (const reg of registrations) {
    if (reg.status === 'confirmed' || reg.status === 'waitlist') {
      userRegistrations.set(reg.eventId, {
        id: reg.id,
        status: reg.status,
      })
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-namo-cyan/10">
            <CalendarHeart className="h-5 w-5 text-namo-cyan" />
          </div>
          <h1 className="text-2xl font-bold text-namo-charcoal">
            Calendario del volontario
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Scopri gli eventi interni e iscriviti come volontario
        </p>
      </div>

      <CalendarView events={events} userRegistrations={userRegistrations} />
    </div>
  )
}
