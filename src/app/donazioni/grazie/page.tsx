import Image from 'next/image'
import Link from 'next/link'
import { Heart, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Grazie! — Namo APS',
}

export default function GraziePage() {
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
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-namo-green/10">
          <Heart className="h-10 w-10 text-namo-green" />
        </div>
        <h1 className="text-3xl font-bold text-namo-charcoal">
          Grazie di cuore!
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          La tua donazione è stata ricevuta con successo. Il tuo contributo è
          prezioso e ci permette di continuare le nostre attività di
          volontariato.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Se hai inserito un indirizzo email, riceverai una conferma a breve.
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-8 rounded-full"
        >
          <Link href="/donazioni">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alla pagina donazioni
          </Link>
        </Button>
      </main>
    </div>
  )
}
