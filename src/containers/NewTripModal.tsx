import { FC, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, InfoIcon } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { Button, Input } from '@/components/ui'
import { Calendar } from '@/components/ui/Calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { useUser } from '@/hooks/useUser'
import { cn } from '@/lib/utils'
import { useHikerProfilesQuery } from '@/queries/hiker-profile'
import { useCreatePack } from '@/queries/pack'
import { useCreateTrip } from '@/queries/trip'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NewTripModal: FC<Props> = ({ open, onOpenChange }) => {
  const navigate = useNavigate()
  const user = useUser()
  const createTrip = useCreateTrip()
  const createPack = useCreatePack()
  const { data: profiles } = useHikerProfilesQuery()
  const defaultProfile = profiles?.find(p => p.is_default) ?? profiles?.[0]

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [dates, setDates] = useState<DateRange | undefined>()
  const [distance, setDistance] = useState('')

  const isPending = createTrip.isPending || createPack.isPending
  const isValid = title.trim().length > 0

  const reset = () => {
    setTitle('')
    setLocation('')
    setDates(undefined)
    setDistance('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isPending) return

    const trip = await createTrip.mutateAsync({
      title: title.trim(),
      location: location.trim() || undefined,
      start_date: dates?.from ? format(dates.from, 'yyyy-MM-dd') : undefined,
      end_date: dates?.to ? format(dates.to, 'yyyy-MM-dd') : undefined,
      distance: distance ? Number(distance) : undefined,
    })

    await createPack.mutateAsync({
      title: 'Main Pack',
      trip_id: trip.id,
      items: [],
      hiker_profile_id: defaultProfile?.id ?? null,
    })

    reset()
    onOpenChange(false)
    navigate({ to: '/pack/$id', params: { id: String(trip.id) } })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) reset()
        onOpenChange(v)
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Pack</DialogTitle>
            <DialogDescription>
              Create a trip and start building your packing list.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 px-6 py-5">
            <div className="grid gap-1">
              <Label htmlFor="trip-title">Trip Name *</Label>
              <Input
                id="trip-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="SHT Segment 1"
                autoFocus
              />
            </div>

            <div className="grid gap-1">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="trip-location">Trail name or location</Label>
                <Tooltip>
                  <TooltipTrigger type="button" tabIndex={-1}>
                    <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Be as specific as possible. We'll use this to gather
                    detailed information about your trip.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="trip-location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="SHT Oberg Mountain Loop"
              />
            </div>

            <div className="grid gap-1">
              <Label>Dates</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dates?.from && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dates?.from ? (
                      dates.to ? (
                        <>
                          {format(dates.from, 'LLL dd')} -{' '}
                          {format(dates.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dates.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Select dates...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dates?.from}
                    selected={dates}
                    onSelect={setDates}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="trip-distance">
                Distance ({user.unit_distance})
              </Label>
              <Input
                id="trip-distance"
                type="number"
                step=".01"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isPending}>
              {isPending ? 'Creating...' : 'Start Packing'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
