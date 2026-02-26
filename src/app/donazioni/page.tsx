import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { DonationForm } from '@/components/donations/donation-form'

export const metadata = {
  title: 'Sostieni Namo APS — Donazione',
  description: 'Fai una donazione a Namo APS per sostenere le nostre attività di volontariato.',
}

export default function DonazioniPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-namo-cream to-white">
      {/* Header */}
      <header className="border-b border-border/40 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Namo APS"
              width={100}
              height={40}
              className="h-auto w-auto"
            />
          </Link>
          <Link
            href="/accedi"
            className="text-sm font-medium text-namo-charcoal/70 transition-colors hover:text-namo-cyan"
          >
            Accedi
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-xl px-4 py-12">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-namo-orange/10">
            <Heart className="h-8 w-8 text-namo-orange" />
          </div>
          <h1 className="text-3xl font-bold text-namo-charcoal">
            Sostieni Namo APS
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Il tuo contributo ci permette di continuare le nostre attività di
            volontariato a sostegno della comunità. Ogni donazione fa la
            differenza!
          </p>
        </div>

        {/* Donation Form */}
        <DonationForm />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <p>Namo APS — Associazione di Promozione Sociale</p>
      </footer>
    </div>
  )
}
