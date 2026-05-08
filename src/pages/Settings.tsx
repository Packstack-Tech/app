import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircleIcon, SparklesIcon } from 'lucide-react'

import { Button, Input } from '@/components/ui'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
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
  const { isSubscribed, openUpgrade, managementUrl } = useSubscription()
  const updateUser = useUpdateUser()

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
        </Form>

        <div className="flex justify-end">
          <Button disabled={updateUser.isPending}>
            Save
          </Button>
        </div>
      </form>

      <hr className="border-border" />

      <section className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Plan
        </h3>
        <div className="flex items-center justify-between rounded-md border px-4 py-3">
          {isSubscribed ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="size-4 text-green-500" />
                <span className="text-sm font-medium">Full Access</span>
              </div>
              {managementUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={managementUrl} target="_blank" rel="noreferrer">
                    Manage my plan
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Free</span>
              </div>
              <Button size="sm" onClick={openUpgrade}>
                <SparklesIcon className="size-3.5 mr-1" />
                Upgrade
              </Button>
            </>
          )}
        </div>
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
