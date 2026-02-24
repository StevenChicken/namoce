'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordReset, type AuthActionResult } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail } from 'lucide-react'

export default function RecuperaPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthActionResult, FormData>(
    requestPasswordReset,
    {}
  )

  if (state.success) {
    return (
      <Card className="border-0 shadow-[6px_6px_9px_rgba(0,0,0,0.08)]">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-namo-cyan/10">
            <Mail className="h-8 w-8 text-namo-cyan" />
          </div>
          <CardTitle className="text-2xl font-bold text-namo-charcoal">Email inviata</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-8 text-muted-foreground">
            Se l&apos;indirizzo è associato a un account, riceverai un&apos;email con le istruzioni per reimpostare la password.
          </p>
          <Link href="/accedi">
            <Button variant="outline" className="rounded-full px-8 font-semibold">
              Torna al login
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-[6px_6px_9px_rgba(0,0,0,0.08)]">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-2xl font-bold text-namo-charcoal">Recupera password</CardTitle>
        <CardDescription>
          Inserisci la tua email per ricevere un link di recupero
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="la-tua@email.it"
              required
              autoComplete="email"
              className="h-11"
            />
          </div>

          <Button type="submit" disabled={isPending} className="mt-1 h-11 w-full rounded-full text-base font-semibold">
            {isPending ? 'Invio in corso...' : 'Invia link di recupero'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/accedi" className="font-medium text-namo-cyan transition-colors hover:text-namo-cyan/80 hover:underline">
            Torna al login
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
