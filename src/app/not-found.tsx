import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-namo-cyan/10">
          <FileQuestion className="h-8 w-8 text-namo-cyan" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-namo-charcoal">
          Pagina non trovata
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Button className="rounded-full bg-namo-charcoal text-white hover:bg-namo-charcoal/90" asChild>
          <Link href="/">Torna alla home</Link>
        </Button>
      </div>
    </div>
  )
}
