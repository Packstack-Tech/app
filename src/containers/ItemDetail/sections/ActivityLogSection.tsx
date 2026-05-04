import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Calendar,
  CircleDot,
  Hammer,
  Package,
  Plus,
  Scale,
  StickyNote,
  Wrench,
} from 'lucide-react'

import { Button, Input } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useCreateItemLog, useItemLogs } from '@/queries/itemLifecycle'
import { CreateItemLog, ItemLogEntry } from '@/types/item'

interface Props {
  itemId: number
}

const EVENT_ICONS: Record<string, FC<{ size?: number; className?: string }>> = {
  acquired: Package,
  condition_change: CircleDot,
  repair: Wrench,
  maintenance: Hammer,
  weight_check: Scale,
  retired: Calendar,
  sold: Calendar,
  note: StickyNote,
}

const EVENT_LABELS: Record<string, string> = {
  acquired: 'Acquired',
  condition_change: 'Condition Change',
  repair: 'Repair',
  maintenance: 'Maintenance',
  weight_check: 'Weight Check',
  retired: 'Retired',
  sold: 'Sold',
  note: 'Note',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const LogEntry: FC<{ entry: ItemLogEntry }> = ({ entry }) => {
  const Icon = EVENT_ICONS[entry.event_type] || StickyNote
  const label = EVENT_LABELS[entry.event_type] || entry.event_type

  const details: string[] = []
  if (entry.old_condition && entry.new_condition) {
    details.push(`${entry.old_condition} → ${entry.new_condition}`)
  }
  if (entry.cost) details.push(`$${Number(entry.cost).toFixed(2)}`)
  if (entry.old_weight && entry.new_weight) {
    details.push(`${entry.old_weight}g → ${entry.new_weight}g`)
  }

  return (
    <div className="flex gap-3 pb-4 last:pb-0">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted shrink-0">
          <Icon size={14} className="text-muted-foreground" />
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-[11px] text-muted-foreground">{formatDate(entry.event_date)}</span>
        </div>
        {details.length > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">{details.join(' · ')}</p>
        )}
        {entry.note && (
          <p className="text-xs text-muted-foreground mt-1">{entry.note}</p>
        )}
      </div>
    </div>
  )
}

type LogFormValues = {
  event_type: string
  event_date: string
  note: string
  cost: string
}

export const ActivityLogSection: FC<Props> = ({ itemId }) => {
  const { data: logs } = useItemLogs(itemId)
  const createLog = useCreateItemLog(itemId)
  const [open, setOpen] = useState(false)

  const form = useForm<LogFormValues>({
    defaultValues: {
      event_type: 'note',
      event_date: new Date().toISOString().split('T')[0],
      note: '',
      cost: '',
    },
  })

  const onSubmit = (data: LogFormValues) => {
    const payload: CreateItemLog = {
      event_type: data.event_type,
      event_date: data.event_date,
      note: data.note || undefined,
      cost: data.cost ? Number(data.cost) : undefined,
    }
    createLog.mutate(payload, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Activity Log</h2>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setOpen(true)}>
          <Plus size={14} /> Add Entry
        </Button>
      </div>

      {logs && logs.length > 0 ? (
        <div>
          {logs.map(entry => (
            <LogEntry key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No activity logged yet.</p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Log Entry</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4 px-6 py-4">
                <FormField
                  control={form.control}
                  name="event_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="note">Note</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step=".01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What happened?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="flex justify-end">
                <Button type="submit" disabled={createLog.isPending}>
                  Save Entry
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
