import { FC } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Settings2 } from 'lucide-react'

import { Button } from '@/components/ui'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/Form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useUser } from '@/hooks/useUser'
import { DISTANCE, distances, temps, weightUnits } from '@/lib/consts'
import { SYSTEM_UNIT } from '@/lib/consts'
import { currencies } from '@/lib/currencies'
import { Mixpanel } from '@/lib/mixpanel'
import { useUpdateUser } from '@/queries/user'

type PreferencesForm = {
  currency: string
  unit_distance: DISTANCE
  unit_weight: SYSTEM_UNIT
  unit_temperature: string
}

const schema = z.object({
  currency: z.string(),
  unit_distance: z.string(),
  unit_weight: z.enum(['IMPERIAL', 'METRIC']),
  unit_temperature: z.enum(['F', 'C']),
})

export const Preferences: FC = () => {
  const user = useUser()
  const updateUser = useUpdateUser()

  const form = useForm<PreferencesForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: user.currency.code || '',
      unit_distance: user.unit_distance || DISTANCE.Kilometers,
      unit_weight: user.unit_weight || 'METRIC',
      unit_temperature: user.unit_temperature || 'F',
    },
  })

  const onSubmit = (data: PreferencesForm) => {
    updateUser.mutate(data, {
      onSuccess: () => {
        Mixpanel.track('Settings:Updated', { ...data })
      },
    })
  }

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center gap-2 mb-3">
        <Settings2 size={14} className="text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Preferences
        </h3>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2.5">
        <Form {...form}>
          <FormField
            control={form.control}
            name="unit_weight"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs">Weight</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                      <SelectContent>
                        {weightUnits.map(({ label, value }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectTrigger>
                  </FormControl>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit_distance"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs">Distance</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                      <SelectContent>
                        {distances.map(({ label, value }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectTrigger>
                  </FormControl>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit_temperature"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs">Temperature</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                      <SelectContent>
                        {temps.map(({ label, value }) => (
                          <SelectItem key={value} value={value}>
                            °{label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectTrigger>
                  </FormControl>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs">Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                      <SelectContent>
                        {currencies.map(({ code, name }) => (
                          <SelectItem key={code} value={code}>
                            ({code}) {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectTrigger>
                  </FormControl>
                </Select>
              </FormItem>
            )}
          />
        </Form>

        <Button size="sm" className="w-full mt-1" disabled={updateUser.isPending}>
          Save
        </Button>
      </form>
    </div>
  )
}
