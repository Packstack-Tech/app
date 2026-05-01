import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { Input } from '@/components/ui'
import {
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
import { Switch } from '@/components/ui/Switch'
import { useUser } from '@/hooks/useUser'
import { convertWeight } from '@/lib/weight'
import { ItemForm, Unit } from '@/types/item'

interface Props {
  form: UseFormReturn<ItemForm>
}

export const SpecsSection: FC<Props> = ({ form }) => {
  const user = useUser()
  const currencySymbol = user.currency.symbol_native || user.currency.symbol

  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-4">Specs</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-end gap-1">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Weight</FormLabel>
                  <Input
                    {...field}
                    type="number"
                    step=".01"
                    placeholder="0.00"
                    onFocus={() => { if (!field.value) field.onChange('') }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <Select
                  onValueChange={v => {
                    const weight = convertWeight(
                      form.getValues('weight'),
                      field.value as Unit,
                      v as Unit
                    )
                    form.setValue('weight', Math.round(weight.weight * 100) / 100)
                    field.onChange(v)
                  }}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-[72px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    {currencySymbol}
                  </span>
                  <Input
                    {...field}
                    type="number"
                    step=".01"
                    placeholder="0.00"
                    className="pl-7"
                    onFocus={() => { if (!field.value) field.onChange('') }}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="calories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calories (kcal)</FormLabel>
                <Input
                  {...field}
                  type="number"
                  step="1"
                  placeholder="0"
                  onFocus={() => { if (!field.value) field.onChange('') }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="consumable"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <label
                htmlFor="consumable"
                className="flex items-center justify-between rounded-lg border border-border p-4 cursor-pointer"
              >
                <div className="space-y-0.5 pr-4">
                  <FormLabel htmlFor="consumable" className="text-sm font-medium cursor-pointer mb-0">
                    Consumable
                  </FormLabel>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Items that get used up on a trip, like food, fuel, or sunscreen. Consumable weight is tracked separately from your base weight.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    id="consumable"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </label>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="product_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product URL</FormLabel>
              <FormControl>
                <Input placeholder="https://" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  )
}
