'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CreditCard } from 'lucide-react'
import { updateMembershipSettings } from '@/features/payments/actions'
import { toast } from 'sonner'

const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]

interface MembershipSettingsFormProps {
  initialAmountCents: number
  initialDeadlineMonth: number
  initialDeadlineDay: number
}

export function MembershipSettingsForm({
  initialAmountCents,
  initialDeadlineMonth,
  initialDeadlineDay,
}: MembershipSettingsFormProps) {
  const router = useRouter()
  const [amountEur, setAmountEur] = useState(
    (initialAmountCents / 100).toFixed(2)
  )
  const [deadlineMonth, setDeadlineMonth] = useState(String(initialDeadlineMonth))
  const [deadlineDay, setDeadlineDay] = useState(String(initialDeadlineDay))
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const amountCents = Math.round(parseFloat(amountEur) * 100)
      if (isNaN(amountCents) || amountCents < 100) {
        toast.error('L\'importo minimo è EUR 1,00')
        return
      }

      const result = await updateMembershipSettings({
        amountCents,
        deadlineMonth: parseInt(deadlineMonth, 10),
        deadlineDay: parseInt(deadlineDay, 10),
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Impostazioni aggiornate con successo')
      router.refresh()
    } catch {
      toast.error('Errore durante il salvataggio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-namo-cyan" />
          <CardTitle>Quota associativa</CardTitle>
        </div>
        <CardDescription>
          Configura l&apos;importo e la scadenza della quota annuale
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="amount">Importo (EUR)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amountEur}
              onChange={(e) => setAmountEur(e.target.value)}
              className="rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Mese scadenza</Label>
              <Select
                value={deadlineMonth}
                onValueChange={setDeadlineMonth}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((name, idx) => (
                    <SelectItem key={idx + 1} value={String(idx + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadlineDay">Giorno scadenza</Label>
              <Input
                id="deadlineDay"
                type="number"
                min="1"
                max="31"
                value={deadlineDay}
                onChange={(e) => setDeadlineDay(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="rounded-full bg-namo-cyan hover:bg-namo-cyan/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salva impostazioni
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
