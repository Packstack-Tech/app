import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Calendar, CircleDot, Package, StickyNote } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import * as z from 'zod'

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
import { ProFeaturePreview } from '@/containers/ItemDetail/sections/ProFeaturePreview'
import { ReplacementSection } from '@/containers/ItemDetail/sections/ReplacementSection'
import { RetirementSection } from '@/containers/ItemDetail/sections/RetirementSection'
import { SpecsSection } from '@/containers/ItemDetail/sections/SpecsSection'
import { useSubscription } from '@/hooks/useSubscription'
import { useCreateItem, useInventory, useUpdateItem } from '@/queries/item'
import { Item, ItemForm as ItemFormValues } from '@/types/item'

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

const formDefaults = (item?: Item): ItemFormValues => ({
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

export const ItemDetailPage: FC<Props> = ({ mode, itemId }) => {
  const navigate = useNavigate()
  const { data: inventory } = useInventory()
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const { isSubscribed, openUpgrade } = useSubscription()
  const [another, setAnother] = useState(false)

  const item = mode === 'edit' && inventory
    ? inventory.find(i => i.id === itemId)
    : undefined

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(schema),
    defaultValues: formDefaults(item),
    values: item ? formDefaults(item) : undefined,
  })

  const watchedStatus = form.watch('status') || 'active'
  const isRetired = watchedStatus === 'retired'
  const isEdit = mode === 'edit'

  const onSubmit = (data: ItemFormValues) => {
    const { itemname, ...payload } = data
    if (isEdit && item) {
      updateItem.mutate(
        { ...payload, name: itemname, id: item.id },
        { onSuccess: () => navigate({ to: '/inventory' }) }
      )
    } else {
      createItem.mutate(
        { ...payload, name: itemname },
        {
          onSuccess: () => {
            if (another) {
              form.reset(formDefaults())
            } else {
              navigate({ to: '/inventory' })
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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Sticky header */}
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
              form="item-detail-form"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6">
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
            <h1 className="text-xl font-bold text-foreground truncate">{heroTitle}</h1>
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
        <form id="item-detail-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <BasicsSection form={form} item={item} />
          <Separator className="my-8" />
          <SpecsSection form={form} />
          <Separator className="my-8" />
          {isSubscribed ? (
            <>
              <LifecycleSection form={form} />
              {isRetired && (
                <>
                  <Separator className="my-8" />
                  <RetirementSection form={form} />
                </>
              )}
            </>
          ) : (
            <ProFeaturePreview
              title="Lifecycle"
              description="Track gear status, condition, acquisition details, and retirement history over time."
              onUpgrade={openUpgrade}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1.5">Status</p>
                  <div className="h-9 rounded-md border bg-muted px-3 flex items-center text-sm text-muted-foreground">Active</div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1.5">Condition</p>
                  <div className="h-9 rounded-md border bg-muted px-3 flex items-center text-sm text-muted-foreground">Good</div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1.5">Acquired Date</p>
                  <div className="h-9 rounded-md border bg-muted px-3 flex items-center text-sm text-muted-foreground">Jan 15, 2025</div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1.5">Acquisition Type</p>
                  <div className="h-9 rounded-md border bg-muted px-3 flex items-center text-sm text-muted-foreground">Purchased</div>
                </div>
              </div>
            </ProFeaturePreview>
          )}
        </form>
      </Form>

      {/* Read-only sections (edit mode only) */}
      {isEdit && item && (
        <>
          <Separator className="my-8" />
          {isSubscribed ? (
            <ReplacementSection itemId={item.id} />
          ) : (
            <ProFeaturePreview
              title="Replacement Score"
              description="See how close your gear is to end-of-life based on age, condition, and category benchmarks."
              onUpgrade={openUpgrade}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-yellow-500 w-[45%]" />
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-yellow-400">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-yellow-400">Moderate wear</span>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> Good</span>
                    <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-yellow-500" /> Moderate</span>
                    <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-red-500" /> Replace</span>
                  </div>
                </div>
              </div>
            </ProFeaturePreview>
          )}
          <Separator className="my-8" />
          {isSubscribed ? (
            <ActivityLogSection itemId={item.id} />
          ) : (
            <ProFeaturePreview
              title="Activity Log"
              description="Record repairs, maintenance, condition changes, and other events for each piece of gear."
              onUpgrade={openUpgrade}
            >
              <div className="space-y-0">
                {[
                  { icon: Package, label: 'Acquired', date: 'Jan 15, 2025', detail: 'Purchased new' },
                  { icon: CircleDot, label: 'Condition Change', date: 'Jun 3, 2025', detail: 'New → Good' },
                  { icon: StickyNote, label: 'Note', date: 'Sep 12, 2025', detail: 'Seam showing wear on left shoulder strap' },
                ].map(({ icon: Icon, label, date, detail }) => (
                  <div key={label} className="flex gap-3 pb-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted shrink-0">
                        <Icon size={14} className="text-muted-foreground" />
                      </div>
                      <div className="w-px flex-1 bg-border mt-1" />
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-[11px] text-muted-foreground">{date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ProFeaturePreview>
          )}
          {item.catalog_product && (
            <>
              <Separator className="my-8" />
              <CatalogSection item={item} />
            </>
          )}
        </>
      )}

      <Separator className="my-8" />
      <Form {...form}>
        <NotesSection form={form} />
      </Form>

      {isEdit && item && (
        <>
          <Separator className="my-8" />
          <DangerZoneSection item={item} onComplete={() => navigate({ to: '/inventory' })} />
        </>
      )}

      <div className="h-12" />
      </div>
    </div>
  )
}
