import { FC, useEffect } from 'react'
import { DateRange } from 'react-day-picker'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

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
import { useToast } from '@/hooks/useToast'
import { initPack, useTripPacks } from '@/hooks/useTripPacks'
import { useUser } from '@/hooks/useUser'
import { cn } from '@/lib/utils'
import { dateToUtc } from '@/lib/utils'
import { useCreatePack, useUpdatePack } from '@/queries/pack'
import { useCreateTrip, useUpdateTrip } from '@/queries/trip'
import { Trip } from '@/types/trip'

type TripFormValues = {
  location: string
  dates?: DateRange
  distance: number
}

interface Props {
  trip?: Trip
}

const formDefaults = (trip?: Trip): TripFormValues => ({
  location: trip?.location || '',
  dates: trip?.start_date
    ? {
      from: dateToUtc(new Date(trip.start_date)),
      to: trip.end_date ? dateToUtc(new Date(trip.end_date)) : undefined,
    }
    : undefined,
  distance: trip?.distance || 0,
})

// TODO define ZOD schema for validation
export const TripForm: FC<Props> = ({ trip }) => {
  const { toast } = useToast()
  const user = useUser()
  const { packs, synced, setPacks } = useTripPacks(
    useShallow(store => ({
      packs: store.packs,
      synced: store.synced,
      setPacks: store.setPacks,
    }))
  )
  const createTrip = useCreateTrip()
  const createPack = useCreatePack()
  const updateTrip = useUpdateTrip()
  const updatePack = useUpdatePack()

  const form = useForm<TripFormValues>({
    defaultValues: formDefaults(trip),
  })

  useEffect(() => {
    form.reset(formDefaults(trip))
  }, [trip])

  const getPackPayload = ({ location, dates, distance }: TripFormValues) => ({
    title: location,
    location: location,
    start_date: dates?.from ? format(dates.from, 'yyyy-MM-dd') : undefined,
    end_date: dates?.to ? format(dates.to, 'yyyy-MM-dd') : undefined,
    distance,
  })

  const onFieldUpdate = () => {
    if (!trip) return
    const formData = form.getValues()
    const payload = getPackPayload(formData)
    updateTrip.mutate({ id: trip.id, ...payload })
  }

  // Auto-save when editing existing trip
  useEffect(() => {
    async function savePacks(tripId: number) {
      packs.forEach(async pack => {
        if (pack.id) {
          await updatePack.mutateAsync({
            id: pack.id,
            data: pack,
          })
        } else {
          await createPack.mutateAsync({
            title: pack.title,
            items: pack.items,
            trip_id: tripId,
          })
        }
      })
      toast({
        title: 'Pack updated',
      })
    }

    if (trip?.id && !synced) {
      savePacks(trip.id)
    }
  }, [trip, synced, packs])

  // saves new pack and redirects to pack page
  const onSubmit = async (data: TripFormValues) => {
    const payload = getPackPayload(data)
    const newTrip = await createTrip.mutateAsync(payload)
    await Promise.all(
      packs.map(async ({ title, items }) => {
        await createPack.mutateAsync({
          title,
          items,
          trip_id: newTrip.id,
        })
      })
    )

    setPacks([initPack])
    window.location.replace(`/pack/${newTrip.id}`)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        id="pack-form"
        className="w-1/2 md:w-full"
      >
        <div className='flex flex-col gap-4'>
          <div className="text-sm font-semibold">Details</div>
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
                    onFocus={() => {
                      if (!field.value) field.onChange('')
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}
