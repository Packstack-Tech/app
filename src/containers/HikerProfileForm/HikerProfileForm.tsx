import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button, Input } from '@/components/ui'
import { Checkbox } from '@/components/ui/Checkbox'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { useUser } from '@/hooks/useUser'
import {
  useCreateHikerProfile,
  useUpdateHikerProfile,
} from '@/queries/hiker-profile'
import type { HikerProfile } from '@/types/hiker-profile'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  weight: z.coerce.number().positive().nullable().optional(),
  height: z.coerce.number().positive().nullable().optional(),
  year_of_birth: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .nullable()
    .optional(),
  sex: z.enum(['male', 'female']).nullable().optional(),
  body_type: z.enum(['average', 'muscular']).nullable().optional(),
  is_default: z.boolean(),
})

type FormValues = z.infer<typeof schema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile?: HikerProfile | null
  isFirstProfile?: boolean
}

export const HikerProfileForm = ({
  open,
  onOpenChange,
  profile,
  isFirstProfile = false,
}: Props) => {
  const user = useUser()
  const createProfile = useCreateHikerProfile()
  const updateProfile = useUpdateHikerProfile()

  const isMetric = user.unit_weight === 'METRIC'
  const weightLabel = isMetric ? 'Weight (kg)' : 'Weight (lb)'
  const heightLabel = isMetric ? 'Height (cm)' : 'Height (in)'

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      weight: null,
      height: null,
      year_of_birth: null,
      sex: null,
      body_type: null,
      is_default: isFirstProfile,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: profile?.name ?? '',
        weight: profile?.weight ?? null,
        height: profile?.height ?? null,
        year_of_birth: profile?.year_of_birth ?? null,
        sex: profile?.sex ?? null,
        body_type: profile?.body_type ?? null,
        is_default: profile?.is_default ?? isFirstProfile,
      })
    }
  }, [open, profile, isFirstProfile, form])

  const isEditing = !!profile
  const isPending = createProfile.isPending || updateProfile.isPending

  const onSubmit = (data: FormValues) => {
    const payload = {
      name: data.name,
      weight: data.weight || null,
      height: data.height || null,
      year_of_birth: data.year_of_birth || null,
      sex: data.sex || null,
      body_type: data.body_type || null,
      is_default: data.is_default,
    }

    if (isEditing) {
      updateProfile.mutate(
        { id: profile.id, data: payload },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createProfile.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Hiker Profile' : 'New Hiker Profile'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 px-6 py-4"
        >
          <Form {...form}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{weightLabel}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="0"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e =>
                          field.onChange(
                            e.target.value === '' ? null : e.target.value
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{heightLabel}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="0"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e =>
                          field.onChange(
                            e.target.value === '' ? null : e.target.value
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="year_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year of Birth</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 1990"
                      {...field}
                      value={field.value ?? ''}
                      onChange={e =>
                        field.onChange(
                          e.target.value === '' ? null : e.target.value
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </SelectTrigger>
                      </FormControl>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                          <SelectContent>
                            <SelectItem value="average">Average</SelectItem>
                            <SelectItem value="muscular">Muscular</SelectItem>
                          </SelectContent>
                        </SelectTrigger>
                      </FormControl>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_default"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isFirstProfile}
                    />
                  </FormControl>
                  <FormLabel className="mt-0!">Default profile</FormLabel>
                </FormItem>
              )}
            />
          </Form>

          <DialogFooter className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isEditing ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
