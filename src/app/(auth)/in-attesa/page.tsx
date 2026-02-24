'use client'

import { signOut } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

export default function InAttesaPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-namo-cyan/10">
          <Clock className="h-8 w-8 text-namo-cyan" />
        </div>
        <CardTitle className="text-2xl font-bold">Account in attesa di approvazione</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-6 text-muted-foreground">
          Il tuo account è stato creato con successo, ma deve essere approvato da un amministratore prima di poter accedere alla piattaforma.
        </p>
        <p className="mb-8 text-muted-foreground">
          Riceverai una email quando il tuo account sarà attivato.
        </p>
        <form action={signOut}>
          <Button type="submit" variant="outline" className="rounded-full">
            Esci
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
