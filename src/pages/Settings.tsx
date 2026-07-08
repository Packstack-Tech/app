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
import { HikerProfiles } from '@/containers/Dashboard/HikerProfiles'
import { Preferences } from '@/containers/Dashboard/Preferences'
import { useSubscription } from '@/hooks/useSubscription'
import { useUser } from '@/hooks/useUser'
import { Mixpanel } from '@/lib/mixpanel'
import { useUpdateUser } from '@/queries/user'

type SettingsForm = {
  email: string
}

const schema = z.object({
  email: z.string().email(),
})

export const Settings = () => {
  const user = useUser()
  const updateUser = useUpdateUser()
  const { isSubscribed, openUpgrade, managementUrl } = useSubscription()

  const form = useForm<SettingsForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user.email || '',
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
    <div className="max-w-lg mx-auto my-8 flex flex-col gap-8">
      <div>
        <h2>Settings</h2>
        <p className="text-sm">Manage your account and preferences.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
        </Form>

        <div className="flex justify-end">
          <Button disabled={updateUser.isPending}>
            Save
          </Button>
        </div>
      </form>

      <hr className="border-border" />

      <section className="flex flex-col gap-4">
        <HikerProfiles bare />
      </section>

      <hr className="border-border" />

      <section className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Preferences
        </h3>
        <Preferences bare />
      </section>

      <hr className="border-border" />

      <section className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Subscription
        </h3>
        {isSubscribed ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm">You have full access to Packstack.</p>
            {managementUrl ? (
              <Button asChild variant="outline">
                <a href={managementUrl} target="_blank" rel="noreferrer">
                  Manage subscription
                </a>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Manage your subscription in the app store where you subscribed.
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm">
              Upgrade for unlimited trips, kits and more.
            </p>
            <Button type="button" onClick={openUpgrade}>
              Upgrade
            </Button>
          </div>
        )}
      </section>

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
