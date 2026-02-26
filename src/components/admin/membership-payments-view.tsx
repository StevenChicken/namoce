'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, X, CreditCard, Users, Euro } from 'lucide-react'
import { MarkPaidDialog } from './mark-paid-dialog'
import type { MembershipSettings } from '@/features/payments/queries'

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface VolunteerStatus {
  userId: string
  firstName: string | null
  lastName: string | null
  email: string
  paymentId: string | null
  paymentStatus: string | null
  paidAt: Date | null
  amountCents: number | null
  notes: string | null
}

interface MembershipPaymentsViewProps {
  year: number
  statuses: VolunteerStatus[]
  settings: MembershipSettings
  paidCount: number
  unpaidCount: number
  totalCollectedCents: number
}

export function MembershipPaymentsView({
  year,
  statuses,
  settings,
  paidCount,
  unpaidCount,
  totalCollectedCents,
}: MembershipPaymentsViewProps) {
  const router = useRouter()
  const [markPaidUser, setMarkPaidUser] = useState<{ userId: string; name: string } | null>(null)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-namo-charcoal">Pagamenti quote</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestisci le quote associative dei volontari
          </p>
        </div>
        <Select
          value={String(year)}
          onValueChange={(val) => router.push(`/admin/pagamenti?anno=${val}`)}
        >
          <SelectTrigger className="w-32 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-namo-green/10">
              <Check className="h-5 w-5 text-namo-green" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Pagati
              </p>
              <p className="text-2xl font-bold text-namo-green">{paidCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-namo-orange/10">
              <Users className="h-5 w-5 text-namo-orange" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Non pagati
              </p>
              <p className="text-2xl font-bold text-namo-orange">{unpaidCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-namo-cyan/10">
              <Euro className="h-5 w-5 text-namo-cyan" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Totale raccolto
              </p>
              <p className="text-2xl font-bold text-namo-cyan">
                EUR {formatCents(totalCollectedCents)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quota info */}
      <p className="text-sm text-muted-foreground">
        Quota: EUR {formatCents(settings.amountCents)} — Scadenza:{' '}
        {settings.deadlineDay}/{settings.deadlineMonth}/{year}
      </p>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Volontario
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Stato
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Data pagamento
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody>
                {statuses.map((s) => {
                  const fullName = [s.firstName, s.lastName]
                    .filter(Boolean)
                    .join(' ') || 'Senza nome'
                  const isPaid = !!s.paymentId

                  return (
                    <tr key={s.userId} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium text-namo-charcoal">
                        {fullName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.email}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isPaid ? (
                          <Badge className="bg-namo-green/10 text-namo-green border-namo-green/20">
                            <Check className="mr-1 h-3 w-3" />
                            Pagata
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-namo-orange/10 text-namo-orange border-namo-orange/20">
                            <X className="mr-1 h-3 w-3" />
                            Non pagata
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.paidAt ? formatDate(s.paidAt) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isPaid && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-xs"
                            onClick={() =>
                              setMarkPaidUser({ userId: s.userId, name: fullName })
                            }
                          >
                            <CreditCard className="mr-1 h-3 w-3" />
                            Segna come pagato
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {statuses.length === 0 && (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nessun volontario trovato
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mark paid dialog */}
      {markPaidUser && (
        <MarkPaidDialog
          userId={markPaidUser.userId}
          userName={markPaidUser.name}
          periodYear={year}
          open={!!markPaidUser}
          onOpenChange={(open) => {
            if (!open) setMarkPaidUser(null)
          }}
        />
      )}
    </div>
  )
}
