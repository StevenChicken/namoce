'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Heart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const PRESET_AMOUNTS = [
  { label: 'EUR 10', cents: 1000 },
  { label: 'EUR 25', cents: 2500 },
  { label: 'EUR 50', cents: 5000 },
  { label: 'EUR 100', cents: 10000 },
]

export function DonationForm() {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const amountCents = selectedPreset ?? (customAmount ? Math.round(parseFloat(customAmount) * 100) : 0)

  function handlePresetClick(cents: number) {
    setSelectedPreset(cents)
    setCustomAmount('')
  }

  function handleCustomAmountChange(value: string) {
    setCustomAmount(value)
    setSelectedPreset(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (amountCents < 100) {
      toast.error('L\'importo minimo è EUR 1,00')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/donations/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountCents,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          email: email || undefined,
          message: message || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Errore durante la creazione del pagamento')
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch {
      toast.error('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-namo-charcoal">
              Scegli un importo
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_AMOUNTS.map(({ label, cents }) => (
                <button
                  key={cents}
                  type="button"
                  onClick={() => handlePresetClick(cents)}
                  className={cn(
                    'rounded-xl border-2 px-4 py-3 text-center text-sm font-semibold transition-all',
                    selectedPreset === cents
                      ? 'border-namo-cyan bg-namo-cyan/5 text-namo-cyan'
                      : 'border-border text-namo-charcoal hover:border-namo-cyan/50'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customAmount" className="text-xs text-muted-foreground">
                Oppure inserisci un importo personalizzato (EUR)
              </Label>
              <Input
                id="customAmount"
                type="number"
                min="1"
                step="0.01"
                placeholder="0,00"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Optional fields */}
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Informazioni (opzionali)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs text-muted-foreground">
                  Nome
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs text-muted-foreground">
                  Cognome
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">
                Email (per ricevere la conferma)
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-xs text-muted-foreground">
                Messaggio (opzionale)
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={3}
                className="rounded-lg resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || amountCents < 100}
            className="w-full rounded-full bg-namo-orange hover:bg-namo-orange/90 text-white"
            size="lg"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Heart className="mr-2 h-4 w-4" />
            )}
            {amountCents >= 100
              ? `Dona EUR ${(amountCents / 100).toFixed(2).replace('.', ',')}`
              : 'Dona'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Pagamento sicuro tramite Stripe. Namo APS non memorizza i dati
            della tua carta.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
