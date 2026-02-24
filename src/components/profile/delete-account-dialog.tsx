'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { requestAccountDeletion } from '@/features/users/actions'
import { Trash2 } from 'lucide-react'

export function DeleteAccountDialog() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleConfirm() {
    startTransition(async () => {
      try {
        await requestAccountDeletion()
        toast.success('Richiesta di eliminazione inviata')
        router.push('/accedi')
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Errore durante l'invio della richiesta"
        )
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="border-[#cf2e2e]/30 text-[#cf2e2e] hover:bg-[#cf2e2e]/10 hover:text-[#cf2e2e]"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Richiedi eliminazione account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Richiedi eliminazione account</AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler richiedere l&apos;eliminazione del tuo account e
            di tutti i dati personali? L&apos;eliminazione verrà completata
            entro 30 giorni. Questa azione non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="rounded-full bg-namo-red hover:bg-namo-red/90"
          >
            {isPending ? 'Attendere...' : 'Conferma eliminazione'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
