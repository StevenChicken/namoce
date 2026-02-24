'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye } from 'lucide-react'
import { AuditDetailDialog } from './audit-detail-dialog'
import { ACTION_TYPE_LABELS } from './audit-log-filters'

interface AuditEntry {
  id: string
  actorId: string
  actorFirstName: string | null
  actorLastName: string | null
  actorEmail: string
  actionType: string
  entityType: string
  entityId: string | null
  beforeState: unknown
  afterState: unknown
  createdAt: Date
}

interface AuditLogTableProps {
  entries: AuditEntry[]
}

function truncateId(id: string | null) {
  if (!id) return '—'
  return id.length > 8 ? `${id.slice(0, 8)}…` : id
}

export function AuditLogTable({ entries }: AuditLogTableProps) {
  const [detailEntry, setDetailEntry] = useState<AuditEntry | null>(null)

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead className="font-semibold">Data/ora</TableHead>
              <TableHead className="font-semibold">Attore</TableHead>
              <TableHead className="font-semibold">Azione</TableHead>
              <TableHead className="hidden font-semibold md:table-cell">Entità</TableHead>
              <TableHead className="w-10 font-semibold">Dettagli</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} className="transition-colors hover:bg-muted/30">
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {entry.actorFirstName} {entry.actorLastName}
                </TableCell>
                <TableCell className="text-sm">
                  <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-xs font-medium">
                    {ACTION_TYPE_LABELS[entry.actionType] ?? entry.actionType}
                  </span>
                </TableCell>
                <TableCell className="hidden text-sm md:table-cell">
                  <span className="text-muted-foreground">{entry.entityType}</span>
                  {' '}
                  <span className="font-mono text-xs text-muted-foreground">{truncateId(entry.entityId)}</span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-namo-cyan hover:text-namo-cyan/80"
                    onClick={() => setDetailEntry(entry)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Dettagli</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {detailEntry && (
        <AuditDetailDialog
          open={!!detailEntry}
          onOpenChange={(open) => {
            if (!open) setDetailEntry(null)
          }}
          beforeState={detailEntry.beforeState}
          afterState={detailEntry.afterState}
        />
      )}
    </>
  )
}
