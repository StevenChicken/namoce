'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updatePassword, type AuthActionResult } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ReimpostaPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthActionResult, FormData>(
    updatePassword,
    {}
  )

  if (state.success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Password aggiornata</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-muted-foreground">
            La tua password è stata aggiornata con successo.
          </p>
          <Link href="/accedi">
            <Button className="rounded-full">Vai al login</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Nuova password</CardTitle>
        <CardDescription>Inserisci la tua nuova password</CardDescription>
      </CardHeader>
      <CardContent>
        {state.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Nuova password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">Almeno 6 caratteri</p>
          </div>

          <Button type="submit" disabled={isPending} className="w-full rounded-full">
            {isPending ? 'Aggiornamento in corso...' : 'Aggiorna password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
