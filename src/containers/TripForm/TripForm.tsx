import { FC } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
} from "@/components/ui/Form"

import { Trip } from "@/types/trip"
import { Button, Input } from "@/components/ui"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/Calendar"
import { useCreateTrip, useUpdateTrip } from "@/queries/trip"
import { useCreatePack, useUpdatePack } from "@/queries/pack"
import { useTripPacks } from "@/hooks/useTripPacks"
import { shallow } from "zustand/shallow"

type TripFormValues = {
  location: string
  dates?: DateRange
  distance: number
}

interface Props {
  trip?: Trip
}

// TODO define schema for validation
export const TripForm: FC<Props> = ({ trip }) => {
  const navigate = useNavigate()
  const { packs } = useTripPacks((store) => ({ packs: store.packs }), shallow)
  const createTrip = useCreateTrip()
  const createPack = useCreatePack()
  const updateTrip = useUpdateTrip()
  const updatePack = useUpdatePack()

  const form = useForm<TripFormValues>({
    defaultValues: {
      location: trip?.location || "",
      dates: trip?.start_date
        ? {
            from: new Date(trip.start_date),
            to: trip.end_date ? new Date(trip.end_date) : undefined,
          }
        : undefined,
      distance: trip?.distance || 0,
    },
  })

  const onSubmit = (values: TripFormValues) => {
    const payload = {
      title: values.location,
      location: values.location,
      start_date: values.dates?.from
        ? format(values.dates.from, "yyyy-MM-dd")
        : undefined,
      end_date: values.dates?.to
        ? format(values.dates.to, "yyyy-MM-dd")
        : undefined,
      distance: values.distance,
    }

    if (!trip) {
      createTrip.mutate(payload, {
        onSuccess: async (data) => {
          packs.forEach(async ({ title, items }) => {
            await createPack.mutateAsync({
              title,
              items,
              trip_id: data.id,
            })
          })
          navigate(`/pack/${data.id}`)
        },
      })
    } else {
      updateTrip.mutate(
        { id: trip.id, ...payload },
        {
          onSuccess: async (data) => {
            packs.forEach(async (pack) => {
              if (pack.id) {
                await updatePack.mutateAsync({
                  id: pack.id,
                  data: pack,
                })
              } else {
                await createPack.mutateAsync({
                  title: pack.title,
                  items: pack.items,
                  trip_id: data.id,
                })
              }
            })
          },
        }
      )
    }
  }

  return (
    <>
      <h3>Details</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id="pack-form">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel htmlFor={field.name}>Location</FormLabel>
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
              <FormItem className="my-2">
                <FormLabel htmlFor="date">Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        id="date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value?.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value?.from ? (
                          field.value.to ? (
                            <>
                              {format(field.value?.from, "LLL dd")} -{" "}
                              {format(field.value.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(field.value.from, "LLL dd, y")
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

          <FormField
            control={form.control}
            name="distance"
            render={({ field }) => (
              <FormItem className="my-2">
                <FormLabel htmlFor={field.name}>Distance</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step=".01"
                    placeholder="Distance"
                    onFocus={() => {
                      if (!field.value) field.onChange("")
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  )
}
