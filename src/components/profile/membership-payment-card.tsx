import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Check, Clock } from 'lucide-react'
import { getUserMembershipPayment, getUserMembershipPayments, getMembershipSettings } from '@/features/payments/queries'
import { PayMembershipButton } from './pay-membership-button'

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface MembershipPaymentCardProps {
  userId: string
}

export async function MembershipPaymentCard({ userId }: MembershipPaymentCardProps) {
  const currentYear = new Date().getFullYear()
  const [currentPayment, allPayments, settings] = await Promise.all([
    getUserMembershipPayment(userId, currentYear),
    getUserMembershipPayments(userId),
    getMembershipSettings(),
  ])

  const isPaid = !!currentPayment
  const completedPayments = allPayments.filter((p) => p.status === 'completed')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-namo-cyan" />
          <CardTitle>Quota associativa</CardTitle>
        </div>
        <CardDescription>
          Stato della tua quota per l&apos;anno {currentYear}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current year status */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-namo-charcoal">
              Anno {currentYear}
            </p>
            <p className="text-sm text-muted-foreground">
              EUR {formatCents(settings.amountCents)}
            </p>
          </div>
          {isPaid ? (
            <Badge className="bg-namo-green/10 text-namo-green border-namo-green/20">
              <Check className="mr-1 h-3 w-3" />
              Pagata
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-namo-orange/10 text-namo-orange border-namo-orange/20">
              <Clock className="mr-1 h-3 w-3" />
              Da pagare
            </Badge>
          )}
        </div>

        {/* Pay button if not paid */}
        {!isPaid && <PayMembershipButton periodYear={currentYear} />}

        {/* Payment history */}
        {completedPayments.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Storico pagamenti
            </p>
            <div className="space-y-1.5">
              {completedPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    Anno {payment.periodYear}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      EUR {formatCents(payment.amountCents)}
                    </span>
                    {payment.paidAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(payment.paidAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
