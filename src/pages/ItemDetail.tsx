import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, X } from 'lucide-react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'

import { Button } from '@/components/ui'
import { Checkbox } from '@/components/ui/Checkbox'
import { Form } from '@/components/ui/Form'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/separator'
import { ActivityLogSection } from '@/containers/ItemDetail/sections/ActivityLogSection'
import { BasicsSection } from '@/containers/ItemDetail/sections/BasicsSection'
import { CatalogSection } from '@/containers/ItemDetail/sections/CatalogSection'
import { DangerZoneSection } from '@/containers/ItemDetail/sections/DangerZoneSection'
import { LifecycleSection } from '@/containers/ItemDetail/sections/LifecycleSection'
import { NotesSection } from '@/containers/ItemDetail/sections/NotesSection'
import { ReplacementSection } from '@/containers/ItemDetail/sections/ReplacementSection'
import { RetirementSection } from '@/containers/ItemDetail/sections/RetirementSection'
import { SpecsSection } from '@/containers/ItemDetail/sections/SpecsSection'
import { useUser } from '@/hooks/useUser'
import { getItemDisplayUnit } from '@/lib/weight'
import { useCreateItem, useInventory, useUpdateItem } from '@/queries/item'
import { Item, ItemForm as ItemFormValues, Unit } from '@/types/item'

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
  acquired_date: z.string().optional(),
  acquisition_type: z.string().optional(),
  purchase_retailer: z.string().optional(),
  condition: z.string().optional(),
  status: z.string().optional(),
  retired_date: z.string().optional(),
  retired_reason: z.string().optional(),
  replaced_by_id: z.number().optional(),
})

const formDefaults = (item?: Item, defaultUnit: Unit = 'g'): ItemFormValues => ({
  itemname: item?.name || '',
  brand_id: item?.brand_id || undefined,
  product_id: item?.product_id || undefined,
  product_variant_id: item?.product_variant_id || undefined,
  category_id: item?.category?.category_id || undefined,
  weight: item?.weight || 0,
  unit: item?.unit || defaultUnit,
  price: item?.price || 0,
  calories: item?.calories || 0,
  consumable: item?.consumable || false,
  product_url: item?.product_url || '',
  notes: item?.notes || '',
  acquired_date: item?.acquired_date || '',
  acquisition_type: item?.acquisition_type || '',
  purchase_retailer: item?.purchase_retailer || '',
  condition: item?.condition || '',
  status: item?.status || 'active',
  retired_date: item?.retired_date || '',
  retired_reason: item?.retired_reason || '',
  replaced_by_id: item?.replaced_by_id || undefined,
})

interface Props {
  mode: 'create' | 'edit'
  itemId?: number
  inline?: boolean
  onClose?: () => void
  onCreated?: (id: number) => void
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  wishlist: 'Wishlist',
  retired: 'Retired',
  sold: 'Sold',
  lost: 'Lost',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400',
  wishlist: 'bg-blue-500/15 text-blue-400',
  retired: 'bg-zinc-500/15 text-zinc-400',
  sold: 'bg-emerald-500/15 text-emerald-400',
  lost: 'bg-red-500/15 text-red-400',
}

export const ItemDetailPage: FC<Props> = ({ mode, itemId, inline, onClose, onCreated }) => {
  const navigate = useNavigate()
  const { data: inventory } = useInventory()
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const user = useUser()
  const defaultUnit = getItemDisplayUnit(user.unit_weight)
  const [another, setAnother] = useState(false)

  const item = mode === 'edit' && inventory
    ? inventory.find(i => i.id === itemId)
    : undefined

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(schema),
    defaultValues: formDefaults(item, defaultUnit),
    values: item ? formDefaults(item, defaultUnit) : undefined,
  })

  const watchedStatus = form.watch('status') || 'active'
  const isRetired = watchedStatus === 'retired'
  const isEdit = mode === 'edit'

  const onSubmit = (data: ItemFormValues) => {
    const { itemname, ...payload } = data
    if (isEdit && item) {
      updateItem.mutate({ ...payload, name: itemname, id: item.id })
    } else {
      createItem.mutate(
        { ...payload, name: itemname },
        {
          onSuccess: (newItem) => {
            if (another) {
              form.reset(formDefaults(undefined, defaultUnit))
            } else if (onCreated) {
              onCreated(newItem.id)
            } else {
              navigate({ to: '/inventory/$itemId', params: { itemId: String(newItem.id) } })
            }
          },
        }
      )
    }
  }

  const isSaving = createItem.isPending || updateItem.isPending

  const itemName = form.watch('itemname')
  const brandDisplay = item?.brand?.name
  const productDisplay = item?.product?.name
  const heroTitle = itemName || (isEdit ? 'Untitled Item' : 'New Item')
  const heroSubtitle = [brandDisplay, productDisplay].filter(Boolean).join(' · ')

  const formId = inline ? `item-detail-form-${itemId ?? 'new'}` : 'item-detail-form'

  const headerContent = inline ? (
    <div className="sticky top-0 z-10 bg-background border-b border-border/50 px-4">
      <div className="flex items-center justify-between h-12">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-foreground truncate">{heroTitle}</span>
          {isEdit && (
            <span className={`text-[10px] font-medium rounded-full px-1.5 py-0.5 leading-none shrink-0 ${STATUS_STYLES[watchedStatus] || ''}`}>
              {STATUS_LABELS[watchedStatus] || watchedStatus}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isEdit && (
            <div className="inline-flex items-center gap-1.5 mr-2">
              <Checkbox
                id={`create-another-${formId}`}
                checked={another}
                onCheckedChange={() => setAnother(!another)}
              />
              <Label htmlFor={`create-another-${formId}`} className="font-normal text-xs mb-0">
                Create another
              </Label>
            </div>
          )}
          <Button
            type="submit"
            form={formId}
            size="sm"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="shrink-0 size-8 p-0">
              <X size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="sticky top-0 z-10 bg-background border-b border-border/50 px-4 md:px-6">
      <div className="flex items-center justify-between h-14">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" className="shrink-0" asChild>
            <Link to="/inventory">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Gear Closet</span>
            </Link>
          </Button>
          <span className="text-sm font-medium text-foreground truncate">{heroTitle}</span>
          {isEdit && (
            <span className={`text-[10px] font-medium rounded-full px-1.5 py-0.5 leading-none shrink-0 ${STATUS_STYLES[watchedStatus] || ''}`}>
              {STATUS_LABELS[watchedStatus] || watchedStatus}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isEdit && (
            <div className="inline-flex items-center gap-1.5 mr-2">
              <Checkbox
                id="create-another"
                checked={another}
                onCheckedChange={() => setAnother(!another)}
              />
              <Label htmlFor="create-another" className="font-normal text-xs mb-0">
                Create another
              </Label>
            </div>
          )}
          <Button
            type="submit"
            form={formId}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className={inline ? '' : 'max-w-3xl mx-auto'}>
      {headerContent}

      <div className={inline ? 'px-4 py-4' : 'px-4 md:px-6 py-6'}>
        {/* Hero card */}
        <div className="flex items-start gap-4 mb-8">
          {isEdit && item?.catalog_product?.image_url && (
            <img
              src={item.catalog_product.image_url}
              alt={heroTitle}
              className="w-16 h-16 object-contain rounded-lg bg-muted shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className={`font-bold text-foreground truncate ${inline ? 'text-lg' : 'text-xl'}`}>{heroTitle}</h1>
              {isEdit && (
                <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 leading-none ${STATUS_STYLES[watchedStatus] || ''}`}>
                  {STATUS_LABELS[watchedStatus] || watchedStatus}
                </span>
              )}
            </div>
            {heroSubtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{heroSubtitle}</p>
            )}
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
            <BasicsSection form={form} item={item} />
            <Separator className="my-8" />
            <SpecsSection form={form} />
            <Separator className="my-8" />
            <NotesSection form={form} />
            <Separator className="my-8" />
            <LifecycleSection form={form} />
            {isRetired && (
              <>
                <Separator className="my-8" />
                <RetirementSection form={form} />
              </>
            )}
          </form>
        </Form>

        {/* Read-only sections (edit mode only) */}
        {isEdit && item && (
          <>
            <Separator className="my-8" />
            <ReplacementSection itemId={item.id} />
            <Separator className="my-8" />
            <ActivityLogSection itemId={item.id} />
          </>
        )}

        {isEdit && item?.catalog_product && (
          <>
            <Separator className="my-8" />
            <CatalogSection item={item} />
          </>
        )}

        {isEdit && item && (
          <>
            <Separator className="my-8" />
            <DangerZoneSection item={item} onComplete={onClose ?? (() => navigate({ to: '/inventory' }))} />
          </>
        )}

        <div className="h-12" />
      </div>
    </div>
  )
}
