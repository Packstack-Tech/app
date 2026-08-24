import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Package,
  PackageSearch,
  PencilLine,
  Search,
} from 'lucide-react'

import { Input } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { ItemForm } from '@/containers/ItemForm'
import { useToast } from '@/hooks/useToast'
import { useUser } from '@/hooks/useUser'
import { Mixpanel } from '@/lib/mixpanel'
import { buildQuickAddItem, quickAddItemName } from '@/lib/quickAdd'
import { convertWeight, formatItemWeight, getItemDisplayUnit } from '@/lib/weight'
import { useCategories } from '@/queries/category'
import { useCreateItem } from '@/queries/item'
import { useCatalogGearSearch } from '@/queries/resources'
import { Item, Unit } from '@/types/item'
import { CatalogGearProduct, CatalogGearVariant } from '@/types/resources'

const DEBOUNCE_MS = 400
const MIN_QUERY_LENGTH = 2

const productKey = (p: CatalogGearProduct) => `${p.brand_name}::${p.product_name}`

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * Fired after a successful create with the item the API returned — the trip
   * sidebar uses it to drop the new item straight into the open pack.
   */
  onAdded?: (item: Item, product: CatalogGearProduct) => void
  /**
   * Takes over "Enter gear manually" for callers with their own manual form
   * (the Gear Closet uses the item detail page, not ItemForm). When omitted,
   * quick add swaps itself for ItemForm in place.
   */
  onManualEntry?: () => void
}

export const QuickAddGear: FC<Props> = ({
  open,
  onOpenChange,
  onAdded,
  onManualEntry,
}) => {
  const [mode, setMode] = useState<'search' | 'manual'>('search')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  const user = useUser()
  const itemUnit = getItemDisplayUnit(user.unit_weight)
  const { data: categories } = useCategories()
  // Quick add shows its own toast naming the item, so the generic one is off.
  const createItem = useCreateItem({ notify: false })
  const { toast } = useToast()

  // Every open starts fresh at the search step.
  useEffect(() => {
    if (!open) return
    setMode('search')
    setSearch('')
    setDebouncedSearch('')
    setExpandedKey(null)
  }, [open])

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS)
    return () => clearTimeout(timeout)
  }, [search])

  const { data: results, isFetching } = useCatalogGearSearch(
    debouncedSearch,
    true
  )

  const typedQuery = search.trim()
  const settledQuery = debouncedSearch.trim()
  // Long enough to search, but the debounce hasn't caught up — without this the
  // previous query's results would linger under new input.
  const isSettling = typedQuery !== settledQuery
  const shouldSearch = typedQuery.length >= MIN_QUERY_LENGTH
  const isLoading =
    shouldSearch && (isSettling || isFetching || results === undefined)
  const noResults = shouldSearch && !isLoading && (results?.length ?? 0) === 0
  // Manual entry surfaces exactly when the catalog can't help: nothing typed,
  // too short to search, or a search that came back empty.
  const showManualEntry = !shouldSearch || noResults

  // A new query means the open accordion belongs to a row that's gone.
  useEffect(() => {
    setExpandedKey(null)
  }, [settledQuery])

  useEffect(() => {
    if (noResults && settledQuery) {
      Mixpanel.track('Gear:QuickAdd:no results', { query: settledQuery })
    }
  }, [noResults, settledQuery])

  const addVariant = useCallback(
    (product: CatalogGearProduct, variant: CatalogGearVariant) => {
      if (createItem.isPending) return

      createItem.mutate(
        buildQuickAddItem({ product, variant, categories, unit: itemUnit }),
        {
          onSuccess: item => {
            Mixpanel.track('Gear:QuickAdd:added', {
              brand: product.brand_name,
              product: product.product_name,
              subcategory: product.subcategory,
              variant_count: product.variants.length,
            })
            toast({
              title: `✅ Added ${quickAddItemName(product)}`,
              description: `${product.brand_name} ${product.product_name} is in your gear closet.`,
            })
            onAdded?.(item, product)
            // Reset so the next search starts on the very next keystroke.
            setSearch('')
            setDebouncedSearch('')
            setExpandedKey(null)
            inputRef.current?.focus()
          },
          onError: () =>
            toast({
              title: '⚠️ Could not add that item',
              description: 'Please try again.',
            }),
        }
      )
    },
    [categories, createItem, itemUnit, onAdded, toast]
  )

  const handleSelect = useCallback(
    (product: CatalogGearProduct) => {
      if (product.variants.length === 0) return
      // One variant is unambiguous — add it outright. Several means the choice
      // is the user's, so the row expands rather than guessing a size.
      if (product.variants.length === 1) {
        addVariant(product, product.variants[0])
        return
      }
      const key = productKey(product)
      setExpandedKey(current => (current === key ? null : key))
    },
    [addVariant]
  )

  const handleManualEntry = useCallback(() => {
    Mixpanel.track('Gear:QuickAdd:manual fallback', { query: typedQuery })
    if (onManualEntry) onManualEntry()
    else setMode('manual')
  }, [onManualEntry, typedQuery])

  const manualButton = useMemo(
    () => (
      <button
        type="button"
        onClick={handleManualEntry}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <PencilLine size={13} />
        Enter gear manually
      </button>
    ),
    [handleManualEntry]
  )

  if (mode === 'manual') {
    return (
      <ItemForm
        title="Add Gear"
        open={open}
        onOpenChange={onOpenChange}
        onClose={() => onOpenChange(false)}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Gear</DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4 pb-6">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              ref={inputRef}
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search gear (e.g. X-Mid, sleeping pad)..."
              className="pl-8"
            />
            {createItem.isPending && (
              <Loader2
                size={15}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
              />
            )}
          </div>

          <div className="mt-3 h-[min(50vh,380px)]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <Loader2 className="animate-spin" size={20} />
              </div>
            ) : shouldSearch && !noResults ? (
              <ScrollArea className="h-full" type="always">
                <ul>
                  {(results || []).map(product => {
                    const key = productKey(product)
                    const expanded = expandedKey === key
                    const multiVariant = product.variants.length > 1

                    return (
                      <li key={key} className="border-b border-border/60">
                        <button
                          type="button"
                          onClick={() => handleSelect(product)}
                          disabled={createItem.isPending}
                          className="w-full flex items-center gap-3 py-2 px-1 text-left rounded-sm hover:bg-accent transition-colors cursor-pointer disabled:opacity-60"
                        >
                          <span className="shrink-0 size-10 rounded-md bg-white flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt=""
                                className="size-full object-contain"
                              />
                            ) : (
                              <Package size={16} className="text-muted-foreground" />
                            )}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-[11px] text-muted-foreground truncate">
                              {product.brand_name}
                            </span>
                            <span className="block text-sm font-medium truncate">
                              {product.product_name}
                            </span>
                            {product.subcategory && (
                              <span className="block text-[11px] text-muted-foreground truncate">
                                {[product.category, product.subcategory]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </span>
                            )}
                          </span>

                          <span className="shrink-0 inline-flex items-center gap-1 text-sm tabular-nums">
                            {product.lightest_weight_g != null
                              ? formatItemWeight(
                                  product.lightest_weight_g,
                                  'g',
                                  itemUnit
                                )
                              : '—'}
                            {multiVariant &&
                              (expanded ? (
                                <ChevronDown size={14} className="text-muted-foreground" />
                              ) : (
                                <ChevronRight size={14} className="text-muted-foreground" />
                              ))}
                          </span>
                        </button>

                        {expanded && (
                          <ul className="bg-accent/40 pb-1">
                            <li className="px-2 pt-1.5 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                              Choose a variant
                            </li>
                            {product.variants.map(variant => (
                              <li key={variant.id}>
                                <button
                                  type="button"
                                  onClick={() => addVariant(product, variant)}
                                  disabled={createItem.isPending}
                                  className="w-full flex items-center justify-between gap-3 px-2 py-1.5 text-left text-sm rounded-sm hover:bg-accent transition-colors cursor-pointer disabled:opacity-60"
                                >
                                  <span className="truncate">
                                    {variant.variant_name || 'Standard'}
                                  </span>
                                  <span className="shrink-0 text-muted-foreground tabular-nums">
                                    {variant.weight != null && variant.weight_unit
                                      ? convertWeight(
                                          variant.weight,
                                          variant.weight_unit as Unit,
                                          itemUnit
                                        ).display
                                      : '—'}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </ScrollArea>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-8">
                <PackageSearch size={32} className="text-muted-foreground" />
                {noResults ? (
                  <>
                    <p className="mt-3 text-sm font-medium">
                      No results available
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Nothing in the catalog matches "{settledQuery}".
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Search over 5,000 products by brand, product or type — then
                    click to add one to your gear closet.
                  </p>
                )}
              </div>
            )}
          </div>

          {showManualEntry && (
            <div className="mt-3 pt-3 border-t border-border flex justify-center">
              {manualButton}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
