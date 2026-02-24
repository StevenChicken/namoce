'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateNotificationPreferences } from '@/features/notifications/actions'

interface NotificationPreferencesFormProps {
  initialEnabled: boolean
}

export function NotificationPreferencesForm({
  initialEnabled,
}: NotificationPreferencesFormProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isPending, startTransition] = useTransition()

  function handleToggle(checked: boolean) {
    setEnabled(checked)
    startTransition(async () => {
      try {
        await updateNotificationPreferences({
          informationalEmailsEnabled: checked,
        })
        toast.success('Preferenze aggiornate')
      } catch {
        setEnabled(!checked)
        toast.error('Errore durante il salvataggio')
      }
    })
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <Label
          htmlFor="informational-emails"
          className="text-sm font-medium leading-snug"
        >
          Nuovi eventi nel tuo settore
        </Label>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Ricevi una email quando viene pubblicato un nuovo evento nei settori
          di tuo interesse
        </p>
      </div>
      <Switch
        id="informational-emails"
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
    </div>
  )
}
