import { requireSuperAdmin } from '@/lib/auth'
import { getMembershipSettings } from '@/features/payments/queries'
import { MembershipSettingsForm } from '@/components/admin/membership-settings-form'
import { Settings } from 'lucide-react'

export default async function ImpostazioniPage() {
  await requireSuperAdmin()
  const settings = await getMembershipSettings()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-namo-charcoal/10">
          <Settings className="h-5 w-5 text-namo-charcoal" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-namo-charcoal">Impostazioni</h1>
          <p className="text-sm text-muted-foreground">
            Configura le impostazioni dell&apos;associazione
          </p>
        </div>
      </div>

      <MembershipSettingsForm
        initialAmountCents={settings.amountCents}
        initialDeadlineMonth={settings.deadlineMonth}
        initialDeadlineDay={settings.deadlineDay}
      />
    </div>
  )
}
