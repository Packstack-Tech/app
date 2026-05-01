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

export const LifecycleSection: FC<Props> = ({ form }) => {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-4">Lifecycle</h2>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || 'active'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="wishlist">Wishlist</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Not set" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="worn">Worn</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acquired_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acquired Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acquisition_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acquisition Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Not set" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="purchased">Purchased</SelectItem>
                  <SelectItem value="gifted">Gifted</SelectItem>
                  <SelectItem value="traded">Traded</SelectItem>
                  <SelectItem value="diy">DIY</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purchase_retailer"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Purchase Retailer</FormLabel>
              <FormControl>
                <Input placeholder="REI, Amazon, etc." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  )
}
