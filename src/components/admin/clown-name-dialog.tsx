'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateClownName } from '@/features/users/actions'
import { toast } from 'sonner'

interface ClownNameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  currentClownName: string | null
}

export function ClownNameDialog({
  open,
  onOpenChange,
  userId,
  userName,
  currentClownName,
}: ClownNameDialogProps) {
  const [value, setValue] = useState(currentClownName ?? '')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (!value.trim()) {
      toast.error('Il Nome Clown non può essere vuoto')
      return
    }

    startTransition(async () => {
      try {
        await updateClownName({ userId, clownName: value.trim() })
        toast.success(`Nome Clown di ${userName} aggiornato`)
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Errore durante il salvataggio'
        )
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setValue(currentClownName ?? '')
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-namo-charcoal">
            Nome Clown
          </DialogTitle>
          <DialogDescription>
            Modifica il Nome Clown di {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="clownName">Nome Clown</Label>
          <Input
            id="clownName"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Es. Dottor Sorriso"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Annulla
          </Button>
          <Button
            className="flex-1 rounded-full bg-namo-charcoal hover:bg-namo-charcoal/90"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? 'Salvataggio...' : 'Salva'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
