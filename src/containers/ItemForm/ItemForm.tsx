import { FC, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { Checkbox } from '@/components/ui/Checkbox'
import { Combobox } from '@/components/ui/ComboBox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Label } from '@/components/ui/Label'
import { ScrollArea } from '@/components/ui/ScrollArea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { convertWeight } from '@/lib/weight'
import { useCategories } from '@/queries/category'
import {
  useCreateItem,
  useDeleteItem,
  useProductDetails,
  useUpdateItem,
} from '@/queries/item'
import { useProducts, useSearchBrands } from '@/queries/resources'
import { Item, ItemForm as ItemFormValues, Unit } from '@/types/item'

// TODO add field max/min length
const schema = z.object({
  itemname: z.string().min(1, 'Name is required'),
  brand_id: z.number().optional(),
  brand_new: z.string().optional(),
  product_id: z.number().optional(),
  product_new: z.string().optional(),
  category_id: z.number().optional(),
  category_new: z.string().optional(),
  weight: z.coerce.number().min(0, 'Weight must be positive').optional(),
  unit: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive').optional(),
  consumable: z.boolean().optional(),
  product_url: z.string().optional(),
  notes: z.string().optional(),
})

type Props = {
  item?: Item
  open: boolean
  title: string
  onOpenChange: (open: boolean) => void
  onClose: () => void
  children?: React.ReactNode
}

const formDefaults = (item?: Item) => ({
  itemname: item?.name || '',
  brand_id: item?.brand_id || undefined,
  product_id: item?.product_id || undefined,
  category_id: item?.category?.category_id || undefined,
  weight: item?.weight || 0,
  unit: item?.unit || 'g',
  price: item?.price || 0,
  consumable: item?.consumable || false,
  product_url: item?.product_url || '',
  notes: item?.notes || '',
})

export const ItemForm: FC<Props> = ({
  item,
  title,
  open,
  onOpenChange,
  onClose,
  children,
}) => {
  const [brandSearch, setBrandSearch] = useState(item?.brand?.name || '')
  const [another, setAnother] = useState(false)
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()
  const productDetails = useProductDetails()
  const searchBrands = useSearchBrands({ query: brandSearch, enabled: open })

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(schema),
    defaultValues: formDefaults(item),
  })

  useEffect(() => {
    form.reset(formDefaults(item))
  }, [item])

  const brandId = form.watch('brand_id')

  const { data: categories } = useCategories()
  const { data: brand } = useProducts({
    brandId,
    enabled: open,
  })

  const noBrandSelected = !brandId && !form.watch('brand_new')

  const brandOptions = useMemo(
    () =>
      (searchBrands.data || []).map(({ id, name }) => ({
        label: name,
        value: id,
      })),
    [searchBrands.data]
  )

  const productOptions = useMemo(
    () =>
      (brand?.products || []).map(({ id, name }) => ({
        label: name,
        value: id,
      })),
    [brand]
  )

  const categoryOptions = useMemo(
    () =>
      (categories || []).map(({ id, name }) => ({
        label: name,
        value: id,
      })),
    [categories]
  )

  const onSelectProduct = (id: number) => {
    const brandId = form.getValues('brand_id')
    productDetails.mutate(
      { productId: id, brandId },
      {
        onSuccess: data => {
          form.setValue('weight', data.median)
          form.setValue('unit', data.unit)
        },
      }
    )
  }

  const onSubmit = (data: ItemFormValues) => {
    const { itemname, ...payload } = data
    if (item) {
      updateItem.mutate(
        { ...payload, name: itemname, id: item.id },
        {
          onSuccess: onClose,
        }
      )
    } else {
      createItem.mutate(
        { ...payload, name: itemname },
        {
          onSuccess: () => {
            form.reset()
            if (!another) {
              onClose()
            }
          },
        }
      )
    }
  }

  const onDelete = () => {
    if (!item) return
    deleteItem.mutate(item.id, {
      onSuccess: onClose,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent onPointerDownOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] w-[100%] px-4" type="always">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="item-form">
              <FormField
                control={form.control}
                name="itemname"
                render={({ field }) => (
                  <FormItem className="my-4">
                    <FormLabel>Item name</FormLabel>
                    <FormControl>
                      <Input placeholder="backpack, tent, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem className="flex flex-col my-4">
                <FormLabel>Manufacturer</FormLabel>

                <Combobox
                  value={brandId}
                  options={brandOptions}
                  onSearch={setBrandSearch}
                  isLoading={searchBrands.isLoading}
                  creatable
                  onSelect={({ label, value, isNew }) => {
                    if (isNew) {
                      form.setValue('brand_new', label)
                    } else {
                      form.setValue('brand_id', value as number)
                    }
                  }}
                  onRemove={() => {
                    form.setValue('brand_id', undefined)
                    form.setValue('brand_new', undefined)
                    form.setValue('product_id', undefined)
                    form.setValue('product_new', undefined)
                  }}
                />
                <FormMessage />
              </FormItem>

              <FormItem className="flex flex-col my-4">
                <FormLabel>Product</FormLabel>

                <Combobox
                  value={form.watch('product_id')}
                  options={productOptions}
                  disabled={noBrandSelected}
                  creatable
                  onSelect={({ label, value, isNew }) => {
                    if (isNew) {
                      form.setValue('product_new', label)
                    } else {
                      const id = value as number
                      form.setValue('product_id', id)
                      onSelectProduct(id)
                    }
                  }}
                  onRemove={() => {
                    form.setValue('product_id', undefined)
                    form.setValue('product_new', undefined)
                  }}
                />

                <FormDescription>
                  {noBrandSelected
                    ? 'Product name requires a manufacturer'
                    : 'Select or create the product name'}
                </FormDescription>
                <FormMessage />
              </FormItem>

              <FormItem className="flex flex-col my-4">
                <FormLabel>Category</FormLabel>

                <Combobox
                  value={form.watch('category_id')}
                  options={categoryOptions}
                  onSelect={({ label, value, isNew }) => {
                    if (isNew) {
                      form.setValue('category_new', label)
                    } else {
                      form.setValue('category_id', value as number)
                    }
                  }}
                  onRemove={() => {
                    form.setValue('category_id', undefined)
                    form.setValue('category_new', undefined)
                  }}
                />

                <FormMessage />
              </FormItem>

              <div className="flex gap-2 items-end my-4">
                <div className="flex flex-1 items-end gap-0.5">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight</FormLabel>
                        <Input
                          {...field}
                          type="number"
                          step=".01"
                          placeholder="0.00"
                          disabled={productDetails.isPending}
                          onFocus={() => {
                            if (!field.value) field.onChange('')
                          }}
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
                            field.value,
                            v as Unit
                          )
                          // round weight to 2 decimal places as number
                          const roundedWeight =
                            Math.round(weight.weight * 100) / 100
                          form.setValue('weight', roundedWeight)
                          field.onChange(v)
                        }}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={productDetails.isPending}
                      >
                        <FormControl>
                          <SelectTrigger className="w-16">
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
                    <FormItem className="flex-1">
                      <FormLabel>Price</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        step=".01"
                        placeholder="0.00"
                        onFocus={() => {
                          if (!field.value) field.onChange('')
                        }}
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
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 my-4">
                    <FormControl>
                      <Checkbox
                        id="consumable"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel htmlFor="consumable" className="font-normal">
                      Consumable
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_url"
                render={({ field }) => (
                  <FormItem className="my-4">
                    <FormLabel>Product URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="my-4">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="https://" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter>
          <div className={`flex justify-between items-center`}>
            {item && (
              <Button
                type="button"
                variant="outline"
                onClick={onDelete}
                disabled={updateItem.isPending || createItem.isPending}
              >
                Delete Item
              </Button>
            )}
            {!item && (
              <div className="inline-flex gap-1.5">
                <Checkbox
                  id="create-another"
                  checked={another}
                  onCheckedChange={() => setAnother(!another)}
                />
                <Label
                  htmlFor="create-another"
                  className="font-normal text-xs mb-0"
                >
                  Create another
                </Label>
              </div>
            )}
            <Button
              type="submit"
              variant="secondary"
              form="item-form"
              className="min-w-[25%]"
              disabled={updateItem.isPending || createItem.isPending}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
