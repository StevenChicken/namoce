'use client'

import { useTransition } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { suspendUser, reactivateUser, deactivateUser, deleteUserData } from '@/features/users/actions'
import { toast } from 'sonner'

type UserAction = 'suspend' | 'reactivate' | 'deactivate' | 'gdpr_delete'

interface ConfirmUserActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: UserAction | null
  userId: string
  userName: string
}

const actionConfig: Record<UserAction, {
  title: string
  description: (name: string) => string
  confirmLabel: string
  fn: (userId: string) => Promise<unknown>
}> = {
  suspend: {
    title: 'Sospendi utente',
    description: (name) =>
      `Sei sicuro di voler sospendere ${name}? L'utente non potrà accedere alla piattaforma fino alla riattivazione.`,
    confirmLabel: 'Sospendi',
    fn: suspendUser,
  },
  reactivate: {
    title: 'Riattiva utente',
    description: (name) =>
      `Sei sicuro di voler riattivare ${name}? L'utente potrà nuovamente accedere alla piattaforma.`,
    confirmLabel: 'Riattiva',
    fn: reactivateUser,
  },
  deactivate: {
    title: 'Disattiva utente',
    description: (name) =>
      `Sei sicuro di voler disattivare ${name}? L'utente non potrà più accedere alla piattaforma.`,
    confirmLabel: 'Disattiva',
    fn: deactivateUser,
  },
  gdpr_delete: {
    title: 'Elimina dati utente (GDPR)',
    description: (name) =>
      `Sei sicuro di voler eliminare tutti i dati personali di ${name}? I dati verranno anonimizzati in modo irreversibile. Le registrazioni agli eventi verranno mantenute per le statistiche.`,
    confirmLabel: 'Elimina dati',
    fn: deleteUserData,
  },
}

export function ConfirmUserActionDialog({
  open,
  onOpenChange,
  action,
  userId,
  userName,
}: ConfirmUserActionDialogProps) {
  const [isPending, startTransition] = useTransition()

  if (!action) return null

  const config = actionConfig[action]

  function handleConfirm() {
    startTransition(async () => {
      try {
        await config.fn(userId)
        toast.success(`${config.title} completato`)
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Errore durante l\'operazione'
        )
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {config.description(userName)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="rounded-full">Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className={
              action === 'reactivate'
                ? 'rounded-full bg-namo-green hover:bg-namo-green/90'
                : action === 'suspend'
                  ? 'rounded-full bg-namo-orange hover:bg-namo-orange/90'
                  : 'rounded-full bg-namo-red hover:bg-namo-red/90' // deactivate + gdpr_delete
            }
          >
            {isPending ? 'Attendere...' : config.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
