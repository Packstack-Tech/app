import { useState } from 'react'
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
import { useUnits } from '@/hooks/useUnits'
import { cmToIn, inToCm, kgToLb, lbToKg } from '@/lib/unitConversions'
import { cn } from '@/lib/utils'
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
  profile?: HikerProfile | null
  isFirstProfile?: boolean
  submitLabel?: string
  fullWidthSubmit?: boolean
  /**
   * Show a local Imperial/Metric toggle that only affects this form's input
   * display + conversion (used in onboarding, before the user's account-wide
   * unit preference is set). Defaults to the account preference otherwise.
   */
  showUnitToggle?: boolean
  /** Hide the "Default profile" checkbox (submits is_default from defaults). */
  hideDefaultToggle?: boolean
  onSuccess?: () => void
}

export const HikerProfileFields = ({
  profile,
  isFirstProfile = false,
  submitLabel,
  fullWidthSubmit = false,
  showUnitToggle = false,
  hideDefaultToggle = false,
  onSuccess,
}: Props) => {
  const units = useUnits()
  const createProfile = useCreateHikerProfile()
  const updateProfile = useUpdateHikerProfile()

  const [isMetric, setIsMetric] = useState(units.isMetricWeight)
  // When the local toggle is active it drives conversions; otherwise fall back
  // to the account-wide preference so the Settings dialog is unchanged.
  const effectiveMetric = showUnitToggle ? isMetric : units.isMetricWeight

  const toDisplayWeight = (kg: number) =>
    effectiveMetric ? kg : kgToLb(kg)
  const toCanonicalWeight = (v: number) =>
    effectiveMetric ? v : lbToKg(v)
  const toDisplayHeight = (cm: number) =>
    effectiveMetric ? cm : cmToIn(cm)
  const toCanonicalHeight = (v: number) =>
    effectiveMetric ? v : inToCm(v)

  const weightLabel = `Weight (${effectiveMetric ? 'kg' : 'lb'})`
  const heightLabel = `Height (${effectiveMetric ? 'cm' : 'in'})`

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name ?? '',
      weight:
        profile?.weight != null
          ? Math.round(toDisplayWeight(profile.weight) * 10) / 10
          : null,
      height:
        profile?.height != null
          ? Math.round(toDisplayHeight(profile.height) * 10) / 10
          : null,
      year_of_birth: profile?.year_of_birth ?? null,
      sex: profile?.sex ?? null,
      body_type: profile?.body_type ?? null,
      is_default: profile?.is_default ?? isFirstProfile,
    },
  })

  const isEditing = !!profile
  const isPending = createProfile.isPending || updateProfile.isPending

  const onSubmit = (data: FormValues) => {
    const payload = {
      name: data.name,
      weight: data.weight ? toCanonicalWeight(data.weight) : null,
      height: data.height ? toCanonicalHeight(data.height) : null,
      year_of_birth: data.year_of_birth || null,
      sex: data.sex || null,
      body_type: data.body_type || null,
      is_default: data.is_default,
    }

    if (isEditing) {
      updateProfile.mutate(
        { id: profile.id, data: payload },
        { onSuccess: () => onSuccess?.() }
      )
    } else {
      createProfile.mutate(payload, {
        onSuccess: () => onSuccess?.(),
      })
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
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

        {showUnitToggle && (
          <div className="flex gap-2">
            {[
              { label: 'Imperial', metric: false },
              { label: 'Metric', metric: true },
            ].map(opt => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setIsMetric(opt.metric)}
                className={cn(
                  'flex-1 rounded-md border py-2 text-sm font-semibold transition-colors',
                  isMetric === opt.metric
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input text-muted-foreground hover:bg-accent/40'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

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

        {!hideDefaultToggle && (
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
        )}
      </Form>

      <div className={cn('flex', fullWidthSubmit ? '' : 'justify-end')}>
        <Button
          type="submit"
          disabled={isPending}
          className={cn(fullWidthSubmit && 'w-full')}
        >
          {submitLabel ?? (isEditing ? 'Save' : 'Create')}
        </Button>
      </div>
    </form>
  )
}
