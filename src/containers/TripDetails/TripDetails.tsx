import { FC, useEffect } from 'react'
import { DateRange } from 'react-day-picker'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react'

import { Button, Input } from '@/components/ui'
import { Calendar } from '@/components/ui/Calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/Form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import { ScrollArea } from '@/components/ui/ScrollArea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useUser } from '@/hooks/useUser'
import {
  PACE_OPTIONS,
  TEMP_CATEGORY_OPTIONS,
  TERRAIN_OPTIONS,
} from '@/lib/tripDetails'
import { cn, dateToUtc } from '@/lib/utils'
import { useUpdateTrip } from '@/queries/trip'
import { Trip } from '@/types/trip'

type TripDetailFormValues = {
  location: string
  dates?: DateRange
  distance: number | ''
  temp_min: number | ''
  temp_max: number | ''
  temp_category: string
  daily_elevation_gain: number | ''
  terrain: string
  pace: string
  notes: string
}

interface Props {
  trip: Trip
  onBack?: () => void
}

const formDefaults = (trip: Trip): TripDetailFormValues => ({
  location: trip.location || '',
  dates: trip.start_date
    ? {
      from: dateToUtc(new Date(trip.start_date)),
      to: trip.end_date ? dateToUtc(new Date(trip.end_date)) : undefined,
    }
    : undefined,
  distance: trip.distance ?? '',
  temp_min: trip.temp_min ?? '',
  temp_max: trip.temp_max ?? '',
  temp_category: trip.temp_category || '',
  daily_elevation_gain: trip.daily_elevation_gain ?? '',
  terrain: trip.terrain || '',
  pace: trip.pace || '',
  notes: trip.notes || '',
})

export const TripDetails: FC<Props> = ({ trip, onBack }) => {
  const user = useUser()
  const updateTrip = useUpdateTrip()

  const form = useForm<TripDetailFormValues>({
    defaultValues: formDefaults(trip),
  })

  useEffect(() => {
    form.reset(formDefaults(trip))
  }, [trip])

  const onSave = (data: TripDetailFormValues) => {
    updateTrip.mutate(
      {
        id: trip.id,
        title: trip.title,
        location: data.location || undefined,
        start_date: data.dates?.from ? format(data.dates.from, 'yyyy-MM-dd') : undefined,
        end_date: data.dates?.to ? format(data.dates.to, 'yyyy-MM-dd') : undefined,
        distance: data.distance === '' ? undefined : Number(data.distance),
        temp_min: data.temp_min === '' ? undefined : Number(data.temp_min),
        temp_max: data.temp_max === '' ? undefined : Number(data.temp_max),
        temp_category: data.temp_category || undefined,
        daily_elevation_gain:
          data.daily_elevation_gain === '' ? undefined : Number(data.daily_elevation_gain),
        terrain: data.terrain || undefined,
        pace: data.pace || undefined,
        notes: data.notes || undefined,
      },
      { onSuccess: () => onBack?.() }
    )
  }

  const tempUnit = user.unit_temperature === 'C' ? '°C' : '°F'
  const distUnit = user.unit_distance

  return (
    <ScrollArea className="h-full">
      <div className="p-5 md:py-5 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          {onBack && (
            <Button variant="ghost" size="icon-sm" onClick={onBack}>
              <ArrowLeft size={16} />
            </Button>
          )}
          <h2 className="text-lg font-semibold">Edit Trip Details</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)}>
            <div className="rounded-lg border border-border bg-card p-5 space-y-5">
              <div className="space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Location & Dates
                </p>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Trail or region..." />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Range</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !field.value?.from && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, 'LLL dd')} –{' '}
                                    {format(field.value.to, 'LLL dd, y')}
                                  </>
                                ) : (
                                  format(field.value.from, 'LLL dd, y')
                                )
                              ) : (
                                <span>Select dates...</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={field.value}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="distance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distance ({distUnit})</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step=".01"
                            placeholder="0"
                            onFocus={() => {
                              if (!field.value) field.onChange('')
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="daily_elevation_gain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Elev. Gain (ft)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="1"
                            placeholder="0"
                            onFocus={() => {
                              if (!field.value) field.onChange('')
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t border-border pt-5 space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Trail Conditions
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="terrain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terrain</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TERRAIN_OPTIONS.map(o => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pace</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PACE_OPTIONS.map(o => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="temp_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min ({tempUnit})</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="—"
                              onFocus={() => {
                                if (field.value === '') field.onChange('')
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="temp_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max ({tempUnit})</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="—"
                              onFocus={() => {
                                if (field.value === '') field.onChange('')
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="temp_category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temp Category</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TEMP_CATEGORY_OPTIONS.map(o => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t border-border pt-5 space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Notes
                </p>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Trail notes, conditions, tips..."
                          rows={4}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t border-border pt-4 flex gap-2">
                <Button type="submit" disabled={updateTrip.isPending}>
                  {updateTrip.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset(formDefaults(trip))
                    onBack?.()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </ScrollArea>
  )
}
