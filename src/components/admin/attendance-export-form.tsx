'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function AttendanceExportForm() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const canExport = startDate && endDate

  function handleExport() {
    if (!canExport) return
    const url = `/api/export/attendance?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-muted-foreground">Da</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full sm:w-[180px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-muted-foreground">A</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full sm:w-[180px]"
          />
        </div>
        <Button
          onClick={handleExport}
          disabled={!canExport}
          className="rounded-full bg-namo-charcoal hover:bg-namo-charcoal/90"
        >
          <Download className="mr-2 h-4 w-4" />
          Scarica CSV
        </Button>
      </div>
    </div>
  )
}
