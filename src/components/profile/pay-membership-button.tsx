'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'
import { createMembershipCheckout } from '@/features/payments/actions'
import { toast } from 'sonner'

interface PayMembershipButtonProps {
  periodYear: number
}

export function PayMembershipButton({ periodYear }: PayMembershipButtonProps) {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const pagamento = searchParams.get('pagamento')
    if (pagamento === 'successo') {
      toast.success('Pagamento effettuato con successo!')
    } else if (pagamento === 'annullato') {
      toast.info('Pagamento annullato')
    }
  }, [searchParams])

  async function handlePay() {
    setLoading(true)
    try {
      const result = await createMembershipCheckout({ periodYear })
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      }
    } catch {
      toast.error('Errore durante la creazione del pagamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePay}
      disabled={loading}
      className="w-full rounded-full bg-namo-cyan hover:bg-namo-cyan/90"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      Paga la quota
    </Button>
  )
}
