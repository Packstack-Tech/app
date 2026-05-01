import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/Form'
import { Textarea } from '@/components/ui/Textarea'
import { ItemForm } from '@/types/item'

interface Props {
  form: UseFormReturn<ItemForm>
}

export const NotesSection: FC<Props> = ({ form }) => {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-4">Notes</h2>
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                placeholder="Add any notes about this item..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  )
}
