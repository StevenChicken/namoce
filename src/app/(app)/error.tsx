'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-namo-red/10">
          <AlertTriangle className="h-8 w-8 text-namo-red" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-namo-charcoal">
          Si è verificato un errore
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          Qualcosa è andato storto. Riprova o torna alla dashboard.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            className="rounded-full bg-namo-charcoal text-white hover:bg-namo-charcoal/90"
          >
            Riprova
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/dashboard">Torna alla dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
