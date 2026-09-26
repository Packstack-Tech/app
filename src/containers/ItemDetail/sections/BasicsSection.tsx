import { FC, useEffect, useMemo, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { InfoIcon } from 'lucide-react'

import { Input } from '@/components/ui'
import { Combobox } from '@/components/ui/ComboBox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { useUser } from '@/hooks/useUser'
import {
  buildVariantOptions,
  catalogVariantValue,
  legacyVariantValue,
  parseVariantValue,
  variantPrefillWeight,
} from '@/lib/catalogVariants'
import { Mixpanel } from '@/lib/mixpanel'
import { convertWeight, getItemDisplayUnit } from '@/lib/weight'
import { useCategoryOptions } from '@/queries/category'
import {
  useCatalogBrands,
  useCatalogProduct,
  useCatalogProducts,
} from '@/queries/resources'
import { Item, ItemForm, Unit } from '@/types/item'
import { CatalogProduct, CatalogVariant } from '@/types/resources'

interface Props {
  form: UseFormReturn<ItemForm>
  item?: Item
}

export const BasicsSection: FC<Props> = ({ form, item }) => {
  const [brandSearch, setBrandSearch] = useState(item?.brand?.name || '')
  const [selectedBrandName, setSelectedBrandName] = useState<string | undefined>(
    item?.brand?.name
  )
  const [selectedProductName, setSelectedProductName] = useState<string | undefined>(
    item?.product?.name
  )
  const [pendingAutoFill, setPendingAutoFill] = useState(false)

  const user = useUser()
  const defaultUnit = getItemDisplayUnit(user.unit_weight)

  const catalogBrands = useCatalogBrands({ query: brandSearch, enabled: true })
  const catalogProducts = useCatalogProducts({
    brand: selectedBrandName,
    enabled: true,
  })
  const { data: catalogProduct } = useCatalogProduct({
    brand: selectedBrandName,
    product: selectedProductName,
    enabled: !!selectedBrandName && !!selectedProductName,
  })

  useEffect(() => {
    setBrandSearch(item?.brand?.name || '')
    setSelectedBrandName(item?.brand?.name)
    setSelectedProductName(item?.product?.name)
  }, [item])

  const brandId = form.watch('brand_id')
  const productId = form.watch('product_id')

  const { options: categoryOptions, categories } = useCategoryOptions()

  const noBrandSelected = !brandId && !form.watch('brand_new')
  const noProductSelected = !productId && !form.watch('product_new')

  const brandOptions = useMemo(() => {
    const fromCatalog =
      catalogBrands.data?.map(b => ({
        label: b.brand_name,
        value: b.brand_id,
      })) || []
    if (item?.brand_id && item.brand?.name && !fromCatalog.some(o => o.value === item.brand_id)) {
      return [{ label: item.brand.name, value: item.brand_id }, ...fromCatalog]
    }
    return fromCatalog
  }, [catalogBrands.data, item?.brand_id, item?.brand?.name])

  const productOptions = useMemo(() => {
    const fromCatalog =
      catalogProducts.data?.map(p => ({
        label: p.product_name,
        value: p.product_id,
      })) || []
    if (
      item?.product_id &&
      item.product?.name &&
      !fromCatalog.some(o => o.value === item.product_id)
    ) {
      return [{ label: item.product.name, value: item.product_id }, ...fromCatalog]
    }
    return fromCatalog
  }, [catalogProducts.data, item?.product_id, item?.product?.name])

  const productVariantOptions = useMemo(
    () =>
      buildVariantOptions({
        product: catalogProduct,
        unit: defaultUnit,
        legacy:
          item?.product_variant_id && item.product_variant?.name
            ? { id: item.product_variant_id, name: item.product_variant.name }
            : undefined,
      }),
    [catalogProduct, defaultUnit, item?.product_variant_id, item?.product_variant?.name]
  )

  // The combobox value: a picked catalog variant, else the item's own
  // variant (matched to the catalog by name when possible).
  const watchedCatalogVariant = form.watch('catalog_variant_id')
  const watchedLegacyVariant = form.watch('product_variant_id')
  const variantValue = useMemo(() => {
    if (watchedCatalogVariant) return catalogVariantValue(watchedCatalogVariant)
    if (item?.catalog_variant_id && item.catalog_product_id === catalogProduct?.id) {
      return catalogVariantValue(item.catalog_variant_id)
    }
    if (watchedLegacyVariant) {
      const name = item?.product_variant?.name?.toLowerCase()
      const match = catalogProduct?.variants.find(v => v.name.toLowerCase() === name)
      return match ? catalogVariantValue(match.id) : legacyVariantValue(watchedLegacyVariant)
    }
    return undefined
  }, [watchedCatalogVariant, watchedLegacyVariant, item, catalogProduct])

  const applyAutoFill = (product: CatalogProduct, variant?: CatalogVariant) => {
    const w = variantPrefillWeight(product, variant)
    if (w) {
      const converted = convertWeight(w.weight, w.unit as Unit, defaultUnit)
      form.setValue('weight', Math.round(converted.weight * 100) / 100)
      form.setValue('unit', defaultUnit)
    }
    if (product.product_url) {
      form.setValue('product_url', product.product_url)
    }
    if (product.category && categories?.length) {
      const suggestion = product.category.toLowerCase()
      const match = categories.find(c => c.name.toLowerCase() === suggestion)
      if (match) form.setValue('category_id', match.id)
    }
  }

  useEffect(() => {
    if (!pendingAutoFill || !catalogProduct) return
    setPendingAutoFill(false)
    applyAutoFill(catalogProduct)
  }, [pendingAutoFill, catalogProduct])

  const selectVariant = ({ label, value, isNew }: { label: string; value?: number | string; isNew?: boolean }) => {
    if (isNew) {
      // Free text: the API resolves it (and researches it) in the background.
      form.setValue('product_variant_new', label)
      form.setValue('product_variant_id', undefined)
      form.setValue('catalog_variant_id', undefined)
      form.setValue('catalog_product_id', undefined)
      return
    }
    const parsed = parseVariantValue(value)
    if (!parsed) return
    if (parsed.kind === 'legacy') {
      form.setValue('product_variant_id', parsed.id)
      form.setValue('product_variant_new', undefined)
      form.setValue('catalog_variant_id', undefined)
      form.setValue('catalog_product_id', undefined)
      return
    }
    const variant = catalogProduct?.variants.find(v => v.id === parsed.id)
    if (!catalogProduct || !variant) return
    // Explicit catalog pick: the API locks the link to exactly this pair.
    form.setValue('catalog_product_id', catalogProduct.id)
    form.setValue('catalog_variant_id', variant.id)
    form.setValue('product_variant_new', variant.name)
    form.setValue('product_variant_id', undefined)
    applyAutoFill(catalogProduct, variant)
    Mixpanel.track('Catalog:VariantSelected', {
      has_weight: variant.has_weight,
      kind: variant.kind,
      source: 'item-form',
    })
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-4">Basics</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
          <FormField
            control={form.control}
            name="itemname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Item Name
                  <span className="ml-1.5 text-[10px] font-normal text-muted-foreground/70 uppercase tracking-wider">required</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="backpack, tent, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem className="flex flex-col">
            <FormLabel>Category</FormLabel>
            <Combobox
              value={form.watch('category_id')}
              options={categoryOptions}
              label="Categories"
              creatable
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
          </FormItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormItem className="flex flex-col">
            <FormLabel>Manufacturer</FormLabel>
            <Combobox
              value={brandId}
              options={brandOptions}
              onSearch={setBrandSearch}
              isLoading={catalogBrands.isLoading}
              creatable
              label="Manufacturers"
              onSelect={({ label, value, isNew }) => {
                if (isNew) {
                  form.setValue('brand_new', label)
                  setSelectedBrandName(undefined)
                } else {
                  form.setValue('brand_id', value as number)
                  const brand = catalogBrands.data?.find(b => b.brand_id === value)
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
                form.setValue('catalog_variant_id', undefined)
                form.setValue('catalog_product_id', undefined)
                setSelectedBrandName(undefined)
                setSelectedProductName(undefined)
              }}
            />
          </FormItem>

          <FormItem className="flex flex-col">
            <FormLabel className="inline-flex items-center gap-1">
              Product
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="size-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Requires a manufacturer</TooltipContent>
              </Tooltip>
            </FormLabel>
            <Combobox
              value={form.watch('product_id')}
              options={productOptions}
              disabled={noBrandSelected}
              creatable
              label="Products"
              onSelect={({ label, value, isNew }) => {
                if (isNew) {
                  form.setValue('product_new', label)
                  setSelectedProductName(undefined)
                } else {
                  form.setValue('product_id', value as number)
                  const product = catalogProducts.data?.find(p => p.product_id === value)
                  setSelectedProductName(product?.product_name)
                  setPendingAutoFill(true)
                }
              }}
              onRemove={() => {
                form.setValue('product_id', undefined)
                form.setValue('product_new', undefined)
                form.setValue('product_variant_id', undefined)
                form.setValue('product_variant_new', undefined)
                form.setValue('catalog_variant_id', undefined)
                form.setValue('catalog_product_id', undefined)
                setSelectedProductName(undefined)
              }}
            />
          </FormItem>

          <FormItem className="flex flex-col">
            <FormLabel className="inline-flex items-center gap-1">
              Variant
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="size-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Size, length, capacity — anything that changes the weight. Colors are fine too but don't affect weight.</TooltipContent>
              </Tooltip>
            </FormLabel>
            <Combobox
              value={variantValue}
              options={productVariantOptions}
              disabled={noBrandSelected || noProductSelected}
              creatable
              label="Variants"
              onSelect={selectVariant}
              onRemove={() => {
                form.setValue('product_variant_id', undefined)
                form.setValue('product_variant_new', undefined)
                form.setValue('catalog_variant_id', undefined)
                form.setValue('catalog_product_id', undefined)
              }}
            />
          </FormItem>
        </div>
      </div>
    </section>
  )
}
