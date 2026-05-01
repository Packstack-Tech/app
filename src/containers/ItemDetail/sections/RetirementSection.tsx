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
import { ItemForm } from '@/types/item'

interface Props {
  form: UseFormReturn<ItemForm>
}

export const RetirementSection: FC<Props> = ({ form }) => {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-4">Retirement</h2>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="retired_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retired Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="retired_reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="worn_out">Worn Out</SelectItem>
                  <SelectItem value="upgraded">Upgraded</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="gifted">Gifted</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  )
}
