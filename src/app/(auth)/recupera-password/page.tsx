'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordReset, type AuthActionResult } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function RecuperaPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthActionResult, FormData>(
    requestPasswordReset,
    {}
  )

  if (state.success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email inviata</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-muted-foreground">
            Se l&apos;indirizzo è associato a un account, riceverai un&apos;email con le istruzioni per reimpostare la password.
          </p>
          <Link href="/accedi">
            <Button variant="outline" className="rounded-full">
              Torna al login
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Recupera password</CardTitle>
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="la-tua@email.it"
              required
              autoComplete="email"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full rounded-full">
            {isPending ? 'Invio in corso...' : 'Invia link di recupero'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/accedi" className="text-namo-cyan hover:underline">
            Torna al login
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
