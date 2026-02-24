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
            <TableRow>
              <TableHead>Data/ora</TableHead>
              <TableHead>Attore</TableHead>
              <TableHead>Azione</TableHead>
              <TableHead className="hidden md:table-cell">Entità</TableHead>
              <TableHead className="w-10">Dettagli</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {new Date(entry.createdAt).toLocaleString('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell className="text-sm">
                  {entry.actorFirstName} {entry.actorLastName}
                </TableCell>
                <TableCell className="text-sm">
                  {ACTION_TYPE_LABELS[entry.actionType] ?? entry.actionType}
                </TableCell>
                <TableCell className="hidden text-sm md:table-cell">
                  <span className="text-muted-foreground">{entry.entityType}</span>
                  {' '}
                  <span className="font-mono text-xs">{truncateId(entry.entityId)}</span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
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
