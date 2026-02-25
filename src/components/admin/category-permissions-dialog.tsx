'use client'

import { useState, useTransition, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { EventCategories } from '@/types/enums'
import { assignCategoryPermission, removeCategoryPermission, fetchUserCategoryPermissions } from '@/features/users/actions'
import { toast } from 'sonner'

interface CategoryPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
}

export function CategoryPermissionsDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: CategoryPermissionsDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [assignedCategories, setAssignedCategories] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)

  const loadPermissions = useCallback(() => {
    startTransition(async () => {
      try {
        const perms = await fetchUserCategoryPermissions(userId)
        const userPerms = perms.map((p) => p.category)
        setAssignedCategories(new Set(userPerms))
        setLoaded(true)
      } catch {
        toast.error('Errore nel caricamento delle categorie')
      }
    })
  }, [userId])

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (next && !loaded) {
      loadPermissions()
    }
    if (!next) {
      setLoaded(false)
    }
  }

  function handleToggle(category: string, checked: boolean) {
    startTransition(async () => {
      try {
        if (checked) {
          await assignCategoryPermission({ userId, category })
          setAssignedCategories((prev) => new Set([...prev, category]))
          toast.success(`Categoria "${category}" assegnata`)
        } else {
          await removeCategoryPermission({ userId, category })
          setAssignedCategories((prev) => {
            const next = new Set(prev)
            next.delete(category)
            return next
          })
          toast.success(`Categoria "${category}" rimossa`)
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Errore durante l\'operazione'
        )
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-namo-charcoal">
            Categorie evento di {userName}
          </DialogTitle>
          <DialogDescription>
            Seleziona le categorie evento che questo admin può gestire
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {!loaded && isPending ? (
            <p className="text-center text-sm text-muted-foreground">Caricamento...</p>
          ) : (
            EventCategories.map((cat) => (
              <div key={cat} className="flex items-center gap-3">
                <Checkbox
                  id={`cat-${cat}`}
                  checked={assignedCategories.has(cat)}
                  onCheckedChange={(checked) => handleToggle(cat, !!checked)}
                  disabled={isPending}
                />
                <Label htmlFor={`cat-${cat}`} className="text-sm font-normal">
                  {cat}
                </Label>
              </div>
            ))
          )}
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
