'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AuditDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  beforeState: unknown
  afterState: unknown
}

function JsonBlock({ label, data }: { label: string; data: unknown }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
      {data ? (
        <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="text-sm italic text-muted-foreground">
          Nessun dato disponibile
        </p>
      )}
    </div>
  )
}

export function AuditDetailDialog({
  open,
  onOpenChange,
  beforeState,
  afterState,
}: AuditDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dettagli modifica</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <JsonBlock label="Stato precedente" data={beforeState} />
          <JsonBlock label="Stato successivo" data={afterState} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
