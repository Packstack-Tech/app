import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button, Input } from '@/components/ui'
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
import { useUser } from '@/hooks/useUser'
import { DISTANCE, distances, weightUnits } from '@/lib/consts'
import { SYSTEM_UNIT } from '@/lib/consts'
import { currencies } from '@/lib/currencies'
import { Mixpanel } from '@/lib/mixpanel'
import { useUpdateUser } from '@/queries/user'

type SettingsForm = {
  email: string
  currency: string
  unit_distance: DISTANCE
  unit_weight: SYSTEM_UNIT
}

const schema = z.object({
  email: z.string().email(),
  currency: z.string(),
  unit_distance: z.string(),
  unit_weight: z.enum(['IMPERIAL', 'METRIC']),
})

export const Settings = () => {
  const user = useUser()
  const updateUser = useUpdateUser()
  const form = useForm<SettingsForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user.email || '',
      currency: user.currency.code || '',
      unit_distance: user.unit_distance || DISTANCE.Kilometers,
      unit_weight: user.unit_weight || 'METRIC',
    },
  })

  const onSubmit = (data: SettingsForm) => {
    updateUser.mutate(data, {
      onSuccess: () => {
        Mixpanel.track('Settings:Updated', { ...data })
      },
    })
  }

  return (
    <div className="max-w-lg mx-auto my-8 flex flex-col gap-6">
      <div>
        <h2>Settings</h2>
        <p className="text-sm">Manage your account and preferences.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Form {...form}>
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Account
            </h3>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <hr className="border-border" />

          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Preferences
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
              <FormField
                control={form.control}
                name="unit_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder="Select weight unit..."
                            defaultValue={field.value}
                          />
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
                  <FormItem>
                    <FormLabel>Distance Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder="Select distance unit..."
                            defaultValue={field.value}
                          />
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
            </div>

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency..." />
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
          </section>
        </Form>

        <div className="flex justify-end">
          <Button disabled={updateUser.isPending}>
            Save
          </Button>
        </div>
      </form>

      <hr className="border-border" />

      <p className="text-sm">
        Packstack is open-source software.{' '}
        <a
          href="https://github.com/Packstack-Tech/app"
          target="_blank"
          className="link"
          rel="noreferrer"
        >
          View on Github
        </a>
      </p>
    </div>
  )
}
