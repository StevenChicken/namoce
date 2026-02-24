import Image from 'next/image'
import Link from 'next/link'
import { getPublishedApertoEventsWithCounts } from '@/features/events/queries'
import { PublicEventsView } from '@/components/events/public-events-view'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Eventi aperti al pubblico — Namo APS',
  description:
    'Scopri gli eventi aperti al pubblico organizzati da Namo APS, associazione di volontariato.',
}

export default async function EventiPubbliciPage() {
  const events = await getPublishedApertoEventsWithCounts()

  // Serialize dates for client component
  const serializedEvents = events.map(event => ({
    ...event,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
  }))

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/eventi" aria-label="Namo APS — Home eventi">
            <Image
              src="/logo.png"
              alt="Namo APS"
              width={100}
              height={40}
              className="h-auto w-auto"
              priority
            />
          </Link>
          <Link
            href="/accedi"
            className="rounded-full bg-namo-charcoal px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-namo-charcoal/90"
          >
            Accedi
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-border/40 bg-gradient-to-b from-namo-cyan/5 to-background">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-3xl font-bold text-namo-charcoal sm:text-4xl">
            Eventi aperti al pubblico
          </h1>
          <p className="mt-3 max-w-xl text-base text-namo-charcoal/60 sm:text-lg">
            Scopri le attivit&agrave; di Namo APS e partecipa ai nostri eventi.
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
          <PublicEventsView events={serializedEvents} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-namo-charcoal text-white">
        <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
          <p className="text-sm text-white/70">
            &copy; 2026 Namo APS &mdash; Associazione di volontariato
          </p>
        </div>
      </footer>
    </div>
  )
}
