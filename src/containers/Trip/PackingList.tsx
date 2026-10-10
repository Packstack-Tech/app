import { FC, useEffect, useMemo, useRef } from 'react'
import {
  CheckSquare,
  Download,
  Flame,
  Link,
  PackageOpen,
  Scale,
  Settings,
  Sparkles,
} from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import { EmptyState } from '@/components/EmptyState'
import { MenuSwitchItem } from '@/components/MenuSwitchItem'
import { CategorizedPackItemsTable } from '@/components/Tables/CategorizedPackItemsTable'
import { Button } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { WeightValue } from '@/components/WeightValue'
import { BreakdownDialog } from '@/containers/BreakdownDialog'
import { useCategorizedPackItems } from '@/hooks/useCategorizedPackItems'
import { useDisplayPrefs, useToggleWeightSystem, useWeightSystem } from '@/hooks/useDisplayPrefs'
import { useOverpack } from '@/hooks/useOverpack'
import { usePackMembership } from '@/hooks/usePackMembership'
import { useToast } from '@/hooks/useToast'
import { useTripPacks } from '@/hooks/useTripPacks'
import { useUser } from '@/hooks/useUser'
import { tripAiReviewText } from '@/lib/aiReview'
import { groupByCategory } from '@/lib/categorize'
import { downloadPackingListCsv } from '@/lib/download'
import { Mixpanel } from '@/lib/mixpanel'
import {
  calculateCategoryWeights,
  calculateWeightBreakdown,
  getConversionUnit,
} from '@/lib/weight'
import { useCreateTrip, useUpdateTrip } from '@/queries/trip'
import { PackItem } from '@/types/pack'
import { Trip } from '@/types/trip'

import { PackTabs } from '../PackTabs/PackTabs'
import { AggregatedPackList } from './AggregatedPackList'
import { columns } from './columns'
import { OverpackContext } from './overpackContext'
import { PackMembershipContext } from './packMembershipContext'

type Props = {
  trip?: Trip
}

function categorizePackItems(items: PackItem[], toUnit: string) {
  const grouped = groupByCategory<PackItem>(
    items,
    item => item.item.category_id?.toString() || 'uncategorized',
    item => item.item.category,
    item => item.sort_order || 0
  )
  return calculateCategoryWeights(grouped, toUnit as never)
}

export const PackingList: FC<Props> = ({ trip }) => {
  const user = useUser()
  const { toast } = useToast()
  const { isPending: creatingTrip } = useCreateTrip()
  const { isPending: updatingTrip } = useUpdateTrip()
  const {
    packs,
    selectedIndex,
    viewMode,
    checklistMode,
    toggleChecklistMode,
  } = useTripPacks(
    useShallow(state => ({
      packs: state.packs,
      selectedIndex: state.selectedIndex,
      viewMode: state.viewMode,
      checklistMode: state.checklistMode,
      toggleChecklistMode: state.toggleChecklistMode,
    }))
  )
  const { showCalories, toggleShowCalories } = useDisplayPrefs(
    useShallow(state => ({
      showCalories: state.showCalories,
      toggleShowCalories: state.toggleShowCalories,
    }))
  )
  const effectiveSystem = useWeightSystem()
  const toggleWeightSystem = useToggleWeightSystem('pack')
  const unit = getConversionUnit(effectiveSystem)
  const isMetric = effectiveSystem === 'METRIC'

  const currentPack = packs[selectedIndex]
  const isSavedPack = !!currentPack?.id
  const currentItems = currentPack?.items ?? []

  const weights = useMemo(
    () => calculateWeightBreakdown(currentItems, unit),
    [currentItems, unit]
  )

  const breakdownData = useMemo(
    () => categorizePackItems(currentItems, unit),
    [currentItems, unit]
  )

  const availablePacks = useMemo(
    () =>
      packs.map(({ id, title }, idx) => ({
        index: idx,
        id,
        title,
      })),
    [packs]
  )

  const tableCols = useMemo(() => {
    const cols = columns(user.currency)
    if (!showCalories) return cols.filter(c => c.id !== 'kcal')
    return cols
  }, [user.currency, showCalories])

  const categorizedItems = useCategorizedPackItems(currentItems)

  // The All overview is only reachable with more than one pack; the store keeps
  // viewMode off 'all' below that, but guard here too for a clean render.
  const showAll = viewMode === 'all' && packs.length > 1

  // Computed once here and provided to the rows, never per cell.
  const membership = usePackMembership()
  const overpack = useOverpack()

  // One event per trip visit when the warning is actually visible, so the
  // metric reads "trips where a user saw it", not "renders".
  const warnedRef = useRef(false)
  useEffect(() => {
    if (warnedRef.current || overpack.settings.mode === 'off' || overpack.overCount === 0) return
    warnedRef.current = true
    Mixpanel.track('Overpack:WarningShown', {
      mode: overpack.settings.mode,
      item_count: overpack.overCount,
      pack_count: packs.length,
    })
  }, [overpack.overCount, overpack.settings.mode, packs.length])

  const colgroup = useMemo(
    () => (
      <colgroup>
        <col style={{ width: 30 }} />
        {tableCols.map((col, i) => (
          <col key={i} style={{ width: (col.meta as any)?.style?.width }} />
        ))}
      </colgroup>
    ),
    [tableCols]
  )

  return (
    <div>
      <div className="mb-2 flex gap-4 justify-between items-center">
        <PackTabs packs={availablePacks} />
        <div className="flex items-center gap-2">
          {isSavedPack && !showAll && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings size={14} />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <MenuSwitchItem
                  icon={CheckSquare}
                  label="Checklist mode"
                  checked={checklistMode}
                  onToggle={toggleChecklistMode}
                />
                <MenuSwitchItem
                  icon={Scale}
                  label="Metric units"
                  checked={isMetric}
                  onToggle={toggleWeightSystem}
                />
                <MenuSwitchItem
                  icon={Flame}
                  label="Show calories"
                  checked={showCalories}
                  onToggle={() => {
                    toggleShowCalories()
                    Mixpanel.track('Inventory:HideCalories', {
                      hidden: showCalories,
                      source: 'pack',
                    })
                  }}
                />
                <DropdownMenuItem
                  onClick={() => {
                    downloadPackingListCsv(currentPack.items, {
                      currency: user.currency,
                      title: currentPack.title,
                    })
                    Mixpanel.track('Trip:Export packing list', {
                      packId: currentPack.id,
                    })
                  }}
                >
                  <Download size={14} />
                  Export packing list
                </DropdownMenuItem>
                {!!trip && (
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://packstack.io/pack/${trip.uuid}`
                      )
                      Mixpanel.track('Trip:Copy shareable link', {
                        id: trip.uuid,
                      })
                      toast({ title: 'Link copied', duration: 1000 })
                    }}
                  >
                    <Link size={14} />
                    Copy Public URL
                  </DropdownMenuItem>
                )}
                {!!trip && (
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        // Fetch first, then write: the markdown is the payload,
                        // not the URL, so it works in assistants that can't
                        // fetch links.
                        const text = await tripAiReviewText(trip)
                        await navigator.clipboard.writeText(text)
                        Mixpanel.track('Trip:Copy for AI', { id: trip.uuid })
                        toast({
                          title: 'Copied for AI',
                          description:
                            'Trip and gear list are on your clipboard with a shakedown prompt. Paste into any AI assistant.',
                          duration: 4000,
                        })
                      } catch {
                        toast({
                          title: "Couldn't copy for AI",
                          description: 'Please try again in a moment.',
                          duration: 3000,
                        })
                      }
                    }}
                  >
                    <Sparkles size={14} />
                    Copy for AI
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {!trip && (
            <Button
              type="submit"
              size="lg"
              form="pack-form"
              disabled={creatingTrip || updatingTrip}
            >
              Save
            </Button>
          )}
        </div>
      </div>

      {showAll && <AggregatedPackList />}

      {!showAll && currentItems.length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              Base <WeightValue className="ml-1 font-medium text-foreground" value={weights.base} unit={unit} system={effectiveSystem} format="precise" />
            </span>
            <span className="text-border">|</span>
            <span>
              Worn <WeightValue className="ml-1 font-medium text-foreground" value={weights.worn} unit={unit} system={effectiveSystem} format="precise" />
            </span>
            <span className="text-border">|</span>
            <span>
              Consumable <WeightValue className="ml-1 font-medium text-foreground" value={weights.consumable} unit={unit} system={effectiveSystem} format="precise" />
            </span>
            <span className="text-border">|</span>
            <span>
              Total <WeightValue className="ml-1 font-semibold text-primary" value={weights.total} unit={unit} system={effectiveSystem} format="precise" />
            </span>
          </div>
          {breakdownData.length > 0 && (
            <BreakdownDialog data={breakdownData} />
          )}
        </div>
      )}

      {!showAll && categorizedItems.length === 0 && (
        <EmptyState icon={PackageOpen} heading="Your pack is empty">
          <p>
            Browse your inventory on the right and click items to add them to
            this pack.
          </p>
        </EmptyState>
      )}
      {!showAll && (
        <PackMembershipContext.Provider value={membership}>
         <OverpackContext.Provider value={overpack}>
          {categorizedItems.map(({ category, items }) => {
            const categoryName = category?.category?.name || 'Uncategorized'
            return (
              <CategorizedPackItemsTable
                columns={tableCols}
                key={categoryName}
                category={categoryName}
                data={items}
                colgroup={colgroup}
              />
            )
          })}
         </OverpackContext.Provider>
        </PackMembershipContext.Provider>
      )}
    </div>
  )
}
