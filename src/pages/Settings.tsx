import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircleIcon, PencilIcon, PlusIcon, SparklesIcon, TrashIcon } from 'lucide-react'

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
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogDestructiveAction,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { useSubscription } from '@/hooks/useSubscription'
import { useUser } from '@/hooks/useUser'
import { DISTANCE, distances, weightUnits } from '@/lib/consts'
import { SYSTEM_UNIT } from '@/lib/consts'
import { currencies } from '@/lib/currencies'
import { Mixpanel } from '@/lib/mixpanel'
import { useUpdateUser } from '@/queries/user'
import {
  useHikerProfilesQuery,
  useDeleteHikerProfile,
} from '@/queries/hiker-profile'
import { HikerProfileForm } from '@/containers/HikerProfileForm/HikerProfileForm'
import type { HikerProfile } from '@/types/hiker-profile'

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
  const { isSubscribed, openUpgrade } = useSubscription()
  const updateUser = useUpdateUser()
  const { data: hikerProfiles = [] } = useHikerProfilesQuery()
  const deleteProfile = useDeleteHikerProfile()

  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<HikerProfile | null>(null)
  const [deletingProfile, setDeletingProfile] = useState<HikerProfile | null>(null)

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

  const openCreateDialog = () => {
    setEditingProfile(null)
    setProfileDialogOpen(true)
  }

  const openEditDialog = (profile: HikerProfile) => {
    setEditingProfile(profile)
    setProfileDialogOpen(true)
  }

  const handleDeleteProfile = () => {
    if (deletingProfile) {
      deleteProfile.mutate(deletingProfile.id, {
        onSuccess: () => setDeletingProfile(null),
      })
    }
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

      <section className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Plan
        </h3>
        <div className="flex items-center justify-between rounded-md border px-4 py-3">
          {isSubscribed ? (
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="size-4 text-green-500" />
              <span className="text-sm font-medium">Full Access</span>
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

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Hiker Profiles
          </h3>
          <Button variant="outline" size="sm" onClick={openCreateDialog}>
            <PlusIcon className="size-4 mr-1" />
            Add Profile
          </Button>
        </div>

        {hikerProfiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hiker profiles yet. Add one to enable calorie and fitness
            calculations for your trips.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {hikerProfiles.map(profile => (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{profile.name}</span>
                  {profile.is_default && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(profile)}
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingProfile(profile)}
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <HikerProfileForm
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        profile={editingProfile}
        isFirstProfile={hikerProfiles.length === 0 && !editingProfile}
      />

      <AlertDialog
        open={!!deletingProfile}
        onOpenChange={open => !open && setDeletingProfile(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hiker Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deletingProfile?.name}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogDestructiveAction onClick={handleDeleteProfile}>
              Delete
            </AlertDialogDestructiveAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
