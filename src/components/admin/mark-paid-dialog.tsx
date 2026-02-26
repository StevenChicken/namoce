'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { markManualPayment } from '@/features/payments/actions'
import { toast } from 'sonner'

interface MarkPaidDialogProps {
  userId: string
  userName: string
  periodYear: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MarkPaidDialog({
  userId,
  userName,
  periodYear,
  open,
  onOpenChange,
}: MarkPaidDialogProps) {
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      const result = await markManualPayment({
        userId,
        periodYear,
        notes: notes || undefined,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`Pagamento registrato per ${userName}`)
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error('Errore durante la registrazione del pagamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registra pagamento manuale</DialogTitle>
          <DialogDescription>
            Conferma il pagamento della quota {periodYear} per{' '}
            <strong>{userName}</strong>. Questa azione verrà registrata
            nel log di audit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs text-muted-foreground">
              Note (opzionale) — es. &quot;contanti&quot;, &quot;bonifico&quot;
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={2}
              className="resize-none rounded-lg"
              placeholder="Es. Pagamento in contanti"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Annulla
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-full bg-namo-green hover:bg-namo-green/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Conferma pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
