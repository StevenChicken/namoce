'use client'

import { signOut } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Mail } from 'lucide-react'

export default function InAttesaPage() {
  return (
    <Card className="border-0 shadow-[6px_6px_9px_rgba(0,0,0,0.08)]">
      <CardHeader className="pb-4 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-namo-orange/10">
          <Clock className="h-10 w-10 text-namo-orange" />
        </div>
        <CardTitle className="text-2xl font-bold text-namo-charcoal">Account in attesa di approvazione</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-3 text-muted-foreground">
          Il tuo account è stato creato con successo, ma deve essere approvato da un amministratore prima di poter accedere alla piattaforma.
        </p>
        <div className="mx-auto mb-8 flex items-center justify-center gap-2 text-sm text-namo-cyan">
          <Mail className="h-4 w-4" />
          <span>Riceverai una email quando il tuo account sarà attivato.</span>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline" className="rounded-full px-8 font-semibold">
            Esci
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
