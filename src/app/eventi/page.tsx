import Image from 'next/image'
import Link from 'next/link'
import { getPublishedApertoEventsWithCounts } from '@/features/events/queries'
import { PublicEventsView } from '@/components/events/public-events-view'
import type { Metadata } from 'next'

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
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b border-border bg-white">
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
            className="rounded-full border border-namo-charcoal px-4 py-1.5 text-sm font-medium text-namo-charcoal transition-colors hover:bg-namo-charcoal hover:text-white"
          >
            Accedi
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="mb-8 sm:mb-10">
            <h1 className="text-2xl font-bold text-namo-charcoal sm:text-3xl">
              Eventi aperti al pubblico
            </h1>
            <p className="mt-2 text-base text-muted-foreground sm:text-lg">
              Scopri le attivit&agrave; di Namo APS e partecipa ai nostri eventi.
            </p>
          </div>

          <PublicEventsView events={serializedEvents} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-namo-charcoal text-white">
        <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
          <p className="text-sm">
            &copy; 2026 Namo APS &mdash; Associazione di volontariato
          </p>
        </div>
      </footer>
    </div>
  )
}
