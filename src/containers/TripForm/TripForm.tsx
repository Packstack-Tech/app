import { FC, useEffect } from 'react'
import { DateRange } from 'react-day-picker'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'

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
import { useUser } from '@/hooks/useUser'
import { cn, dateToUtc } from '@/lib/utils'
import { useUpdateTrip } from '@/queries/trip'
import { Trip } from '@/types/trip'

type TripFormValues = {
  location: string
  dates?: DateRange
  distance: number
}

interface Props {
  trip: Trip
}

const formDefaults = (trip: Trip): TripFormValues => ({
  location: trip.location || '',
  dates: trip.start_date
    ? {
      from: dateToUtc(new Date(trip.start_date)),
      to: trip.end_date ? dateToUtc(new Date(trip.end_date)) : undefined,
    }
    : undefined,
  distance: trip.distance || 0,
})

export const TripForm: FC<Props> = ({ trip }) => {
  const user = useUser()
  const updateTrip = useUpdateTrip()

  const isEnriching =
    trip.enrich_status === 'pending' || trip.enrich_status === 'processing'

  const form = useForm<TripFormValues>({
    defaultValues: formDefaults(trip),
  })

  useEffect(() => {
    form.reset(formDefaults(trip))
  }, [trip])

  const getTripPayload = ({ location, dates, distance }: TripFormValues) => ({
    title: trip.title,
    location,
    start_date: dates?.from ? format(dates.from, 'yyyy-MM-dd') : undefined,
    end_date: dates?.to ? format(dates.to, 'yyyy-MM-dd') : undefined,
    distance,
  })

  const onFieldUpdate = () => {
    const formData = form.getValues()
    const payload = getTripPayload(formData)
    updateTrip.mutate({ id: trip.id, ...payload })
  }

  return (
    <Form {...form}>
      <div className="w-1/2 md:w-full">
        <div className="flex flex-col gap-4">
          <div className="text-sm font-semibold">Details</div>

          {isEnriching && (
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing trail...
            </div>
          )}

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>Location</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Trail or region..."
                    onBlur={() => onFieldUpdate()}
                    disabled={isEnriching}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dates"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="date">Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        id="date"
                        variant="outline"
                        disabled={isEnriching}
                        className={cn(
                          'w-full justify-start text-left font-normal md:text-sm whitespace-pre overflow-hidden text-ellipsis',
                          !field.value?.from && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value?.from ? (
                          field.value.to ? (
                            <>
                              {format(field.value?.from, 'LLL dd')} -{' '}
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
                      onSelect={e => {
                        field.onChange(e)
                        onFieldUpdate()
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distance"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>
                  Distance ({user.unit_distance})
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step=".01"
                    placeholder="Distance"
                    onBlur={() => onFieldUpdate()}
                    disabled={isEnriching}
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
    </Form>
  )
}
