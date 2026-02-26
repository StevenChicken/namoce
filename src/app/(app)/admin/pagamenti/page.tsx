import { requireSuperAdmin } from '@/lib/auth'
import { getVolunteerPaymentStatuses, getMembershipSettings } from '@/features/payments/queries'
import { MembershipPaymentsView } from '@/components/admin/membership-payments-view'

export default async function PagamentiPage({
  searchParams,
}: {
  searchParams: Promise<{ anno?: string }>
}) {
  await requireSuperAdmin()
  const params = await searchParams
  const year = params.anno ? parseInt(params.anno, 10) : new Date().getFullYear()

  const [statuses, settings] = await Promise.all([
    getVolunteerPaymentStatuses(year),
    getMembershipSettings(),
  ])

  const paidCount = statuses.filter((s) => s.paymentId).length
  const unpaidCount = statuses.filter((s) => !s.paymentId).length
  const totalCollectedCents = statuses
    .filter((s) => s.paymentId)
    .reduce((sum, s) => sum + (s.amountCents ?? 0), 0)

  return (
    <MembershipPaymentsView
      year={year}
      statuses={statuses}
      settings={settings}
      paidCount={paidCount}
      unpaidCount={unpaidCount}
      totalCollectedCents={totalCollectedCents}
    />
  )
}
