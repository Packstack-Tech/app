import { FC, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { InfoIcon, Trash2Icon } from 'lucide-react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { toSelectOptions } from '@/lib/utils'
import { convertWeight } from '@/lib/weight'
import { useCategories } from '@/queries/category'
import { useCreateItem, useDeleteItem, useUpdateItem } from '@/queries/item'
import {
  useCatalogBrands,
  useCatalogEntries,
  useCatalogProducts,
} from '@/queries/resources'
import { Item, ItemForm as ItemFormValues, Unit } from '@/types/item'
import { CatalogEntry } from '@/types/resources'

// TODO add field max/min length
const schema = z.object({
  itemname: z.string().min(1, 'Name is required'),
  brand_id: z.number().optional(),
  brand_new: z.string().optional(),
  product_id: z.number().optional(),
  product_new: z.string().optional(),
  product_variant_id: z.number().optional(),
  product_variant_new: z.string().optional(),
  category_id: z.number().optional(),
  category_new: z.string().optional(),
  weight: z.coerce.number().min(0, 'Weight must be positive').optional(),
  unit: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive').optional(),
  calories: z.coerce.number().min(0, 'Calories must be positive').optional(),
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
  onSave?: (data: ItemFormValues) => void
  children?: React.ReactNode
}

const formDefaults = (item?: Item) => ({
  itemname: item?.name || '',
  brand_id: item?.brand_id || undefined,
  product_id: item?.product_id || undefined,
  product_variant_id: item?.product_variant_id || undefined,
  category_id: item?.category?.category_id || undefined,
  weight: item?.weight || 0,
  unit: item?.unit || 'g',
  price: item?.price || 0,
  calories: item?.calories || 0,
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
  onSave,
  children,
}) => {
  const [brandSearch, setBrandSearch] = useState(item?.brand?.name || '')
  const [selectedBrandName, setSelectedBrandName] = useState<string | undefined>(
    item?.brand?.name
  )
  const [selectedProductName, setSelectedProductName] = useState<string | undefined>(
    item?.product?.name
  )
  const [pendingAutoFill, setPendingAutoFill] = useState(false)
  const [another, setAnother] = useState(false)

  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()

  const catalogBrands = useCatalogBrands({ query: brandSearch, enabled: open })
  const catalogProducts = useCatalogProducts({
    brand: selectedBrandName,
    enabled: open,
  })
  const { data: catalogEntries } = useCatalogEntries({
    brand: selectedBrandName,
    product: selectedProductName,
    enabled: open && !!selectedBrandName && !!selectedProductName,
  })

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(schema),
    defaultValues: formDefaults(item),
  })

  useEffect(() => {
    form.reset(formDefaults(item))
    setBrandSearch(item?.brand?.name || '')
    setSelectedBrandName(item?.brand?.name)
    setSelectedProductName(item?.product?.name)
  }, [item])

  const brandId = form.watch('brand_id')
  const productId = form.watch('product_id')

  const { data: categories } = useCategories()

  const noBrandSelected = !brandId && !form.watch('brand_new')
  const noProductSelected = !productId && !form.watch('product_new')

  const brandOptions = useMemo(
    () =>
      catalogBrands.data?.map(b => ({
        label: b.brand_name,
        value: b.brand_id,
      })) || [],
    [catalogBrands.data]
  )

  const productOptions = useMemo(
    () =>
      catalogProducts.data?.map(p => ({
        label: p.product_name,
        value: p.product_id,
      })) || [],
    [catalogProducts.data]
  )

  const variantEntries = useMemo(
    () => catalogEntries?.filter((e): e is CatalogEntry & { variant_name: string; product_variant_id: number } =>
      e.variant_name != null && e.product_variant_id != null
    ) || [],
    [catalogEntries]
  )

  const productVariantOptions = useMemo(
    () =>
      variantEntries.map(e => ({
        label: e.variant_name,
        value: e.product_variant_id,
      })),
    [variantEntries]
  )

  const categoryOptions = useMemo(
    () => toSelectOptions(categories),
    [categories]
  )

  const applyAutoFill = (entry: CatalogEntry) => {
    if (entry.weight != null) {
      form.setValue('weight', entry.weight)
      form.setValue('unit', (entry.weight_unit || 'g') as Unit)
    }
    if (entry.product_url) {
      form.setValue('product_url', entry.product_url)
    }
    if (entry.category_suggestion && categories?.length) {
      const suggestion = entry.category_suggestion.toLowerCase()
      const match = categories.find(c => c.name.toLowerCase() === suggestion)
      if (match) {
        form.setValue('category_id', match.id)
      }
    }
  }

  useEffect(() => {
    if (!pendingAutoFill || !catalogEntries?.length) return
    setPendingAutoFill(false)
    const base = catalogEntries.find(e => !e.variant_name) || catalogEntries[0]
    applyAutoFill(base)
  }, [pendingAutoFill, catalogEntries])

  const onSubmit = (data: ItemFormValues) => {
    console.log(data)
    const { itemname, ...payload } = data
    if (item) {
      updateItem.mutate(
        { ...payload, name: itemname, id: item.id },
        {
          onSuccess: () => {
            onSave?.(data)
            onClose()
          },
        }
      )
    } else {
      createItem.mutate(
        { ...payload, name: itemname },
        {
          onSuccess: () => {
            form.reset(formDefaults())
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
      <DialogContent
        className="sm:max-w-xl"
        onPointerDownOutside={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] w-[100%] px-6" type="always">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="item-form">
              <FormField
                control={form.control}
                name="itemname"
                render={({ field }) => (
                  <FormItem className="my-5">
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="backpack, tent, etc."
                        {...field}
                        tabIndex={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t border-border pt-5 my-5">
                <FormItem className="flex flex-col mb-5">
                  <FormLabel>Manufacturer</FormLabel>

                  <Combobox
                    value={brandId}
                    options={brandOptions}
                    onSearch={setBrandSearch}
                    isLoading={catalogBrands.isLoading}
                    creatable
                    tabIndex={2}
                    label="Manufacturers"
                    onSelect={({ label, value, isNew }) => {
                      if (isNew) {
                        form.setValue('brand_new', label)
                        setSelectedBrandName(undefined)
                      } else {
                        form.setValue('brand_id', value as number)
                        const brand = catalogBrands.data?.find(
                          b => b.brand_id === value
                        )
                        setSelectedBrandName(brand?.brand_name)
                      }
                    }}
                    onRemove={() => {
                      form.setValue('brand_id', undefined)
                      form.setValue('brand_new', undefined)
                      form.setValue('product_id', undefined)
                      form.setValue('product_new', undefined)
                      form.setValue('product_variant_id', undefined)
                      form.setValue('product_variant_new', undefined)
                      setSelectedBrandName(undefined)
                      setSelectedProductName(undefined)
                    }}
                  />
                  <FormMessage />
                </FormItem>

                <div className="flex gap-4">
                  <FormItem className="flex flex-col w-1/2">
                    <FormLabel className="inline-flex items-center gap-1">
                      Product
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="size-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Requires a manufacturer
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>

                    <Combobox
                      value={form.watch('product_id')}
                      options={productOptions}
                      disabled={noBrandSelected}
                      creatable
                      label="Products"
                      tabIndex={3}
                      onSelect={({ label, value, isNew }) => {
                        if (isNew) {
                          form.setValue('product_new', label)
                          setSelectedProductName(undefined)
                        } else {
                          form.setValue('product_id', value as number)
                          const product = catalogProducts.data?.find(
                            p => p.product_id === value
                          )
                          setSelectedProductName(product?.product_name)
                          setPendingAutoFill(true)
                        }
                      }}
                      onRemove={() => {
                        form.setValue('product_id', undefined)
                        form.setValue('product_new', undefined)
                        form.setValue('product_variant_id', undefined)
                        form.setValue('product_variant_new', undefined)
                        setSelectedProductName(undefined)
                      }}
                    />

                    <FormMessage />
                  </FormItem>

                  <FormItem className="flex flex-col w-1/2">
                    <FormLabel className="inline-flex items-center gap-1">
                      Variant
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="size-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Requires a product. Use for color, size, etc.
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>

                    <Combobox
                      value={form.watch('product_variant_id')}
                      options={productVariantOptions}
                      disabled={noProductSelected}
                      creatable
                      label="Variants"
                      tabIndex={4}
                      onSelect={({ label, value, isNew }) => {
                        if (isNew) {
                          form.setValue('product_variant_new', label)
                        } else {
                          form.setValue('product_variant_id', value as number)
                          const entry = catalogEntries?.find(
                            e => e.product_variant_id === value
                          )
                          if (entry) applyAutoFill(entry)
                        }
                      }}
                      onRemove={() => {
                        form.setValue('product_variant_id', undefined)
                        form.setValue('product_variant_new', undefined)
                      }}
                    />

                    <FormMessage />
                  </FormItem>
                </div>
              </div>

              <div className="border-t border-border pt-5 my-5">
                <FormItem className="flex flex-col mb-5">
                  <FormLabel>Category</FormLabel>

                  <Combobox
                    value={form.watch('category_id')}
                    options={categoryOptions}
                    label="Categories"
                    creatable
                    tabIndex={5}
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

                <div className="flex gap-2 items-end mb-5">
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
                            tabIndex={6}
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
                            const roundedWeight =
                              Math.round(weight.weight * 100) / 100
                            form.setValue('weight', roundedWeight)
                            field.onChange(v)
                          }}
                          defaultValue={field.value}
                          value={field.value}
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

                  <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Calories (kcal)</FormLabel>
                        <Input
                          {...field}
                          type="number"
                          step="1"
                          placeholder="0"
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
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          id="consumable"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="consumable"
                        className="inline-flex items-center gap-1 font-normal"
                      >
                        Consumable
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="size-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Products that get used up during a hike, e.g. food,
                            fuel, sunscreen
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t border-border pt-5 my-5">
                <FormField
                  control={form.control}
                  name="product_url"
                  render={({ field }) => (
                    <FormItem className="mb-5">
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
                    <FormItem className="mb-5">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter>
          <div className="flex justify-between items-center">
            {item && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDelete}
                disabled={updateItem.isPending || createItem.isPending}
              >
                <Trash2Icon className="size-3.5" />
                Archive Item
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
