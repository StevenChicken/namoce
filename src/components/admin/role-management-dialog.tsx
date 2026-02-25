'use client'

import { useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { changeUserType, changeAdminLevel } from '@/features/users/actions'
import { toast } from 'sonner'

interface RoleManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  currentUserType: string
  currentAdminLevel: string
}

export function RoleManagementDialog({
  open,
  onOpenChange,
  userId,
  userName,
  currentUserType,
  currentAdminLevel,
}: RoleManagementDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleChangeUserType(newType: 'utente' | 'volontario') {
    startTransition(async () => {
      try {
        await changeUserType({ userId, userType: newType })
        toast.success(
          newType === 'volontario'
            ? `${userName} è ora volontario`
            : `${userName} è ora utente`
        )
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Errore durante l\'operazione'
        )
      }
    })
  }

  function handleChangeAdminLevel(newLevel: 'none' | 'admin' | 'super_admin') {
    startTransition(async () => {
      try {
        await changeAdminLevel({ userId, adminLevel: newLevel })
        const labels: Record<string, string> = {
          none: 'Nessuno',
          admin: 'Admin',
          super_admin: 'Super Admin',
        }
        toast.success(`Livello admin di ${userName} impostato a ${labels[newLevel]}`)
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Errore durante l\'operazione'
        )
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-namo-charcoal">
            Gestisci ruolo di {userName}
          </DialogTitle>
          <DialogDescription>
            Modifica il tipo utente e il livello amministrativo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Current role display */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Attuale:</span>
            <Badge variant="secondary" className="bg-namo-cyan/10 text-namo-cyan">
              {currentUserType === 'volontario' ? 'Volontario' : 'Utente'}
            </Badge>
            {currentAdminLevel !== 'none' && (
              <Badge variant="default" className={currentAdminLevel === 'super_admin' ? 'bg-namo-charcoal' : 'bg-namo-orange text-white'}>
                {currentAdminLevel === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Badge>
            )}
          </div>

          {/* User Type section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-namo-charcoal">Tipo utente</h4>
            <div className="flex gap-2">
              <Button
                variant={currentUserType === 'utente' ? 'default' : 'outline'}
                className="flex-1 rounded-full"
                disabled={isPending || currentUserType === 'utente'}
                onClick={() => handleChangeUserType('utente')}
              >
                Utente
              </Button>
              <Button
                variant={currentUserType === 'volontario' ? 'default' : 'outline'}
                className="flex-1 rounded-full"
                disabled={isPending || currentUserType === 'volontario'}
                onClick={() => handleChangeUserType('volontario')}
              >
                Volontario
              </Button>
            </div>
            {currentUserType === 'utente' && (
              <p className="text-xs text-muted-foreground">
                Promuovendo a Volontario, l&apos;utente riceverà una notifica email.
                Ricordati di impostare anche il Nome Clown.
              </p>
            )}
          </div>

          <Separator />

          {/* Admin Level section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-namo-charcoal">Livello amministrativo</h4>
            <div className="flex gap-2">
              <Button
                variant={currentAdminLevel === 'none' ? 'default' : 'outline'}
                className="flex-1 rounded-full"
                disabled={isPending || currentAdminLevel === 'none'}
                onClick={() => handleChangeAdminLevel('none')}
              >
                Nessuno
              </Button>
              <Button
                variant={currentAdminLevel === 'admin' ? 'default' : 'outline'}
                className="flex-1 rounded-full"
                disabled={isPending || currentAdminLevel === 'admin'}
                onClick={() => handleChangeAdminLevel('admin')}
              >
                Admin
              </Button>
              <Button
                variant={currentAdminLevel === 'super_admin' ? 'default' : 'outline'}
                className="flex-1 rounded-full"
                disabled={isPending || currentAdminLevel === 'super_admin'}
                onClick={() => handleChangeAdminLevel('super_admin')}
              >
                Super Admin
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Admin: gestisce eventi per le categorie assegnate. Super Admin: accesso completo.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
