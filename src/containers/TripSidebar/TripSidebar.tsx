import { FC, useCallback, useMemo, useState } from 'react'
import { Loader2, Pencil, Scale } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import { ScrollArea } from '@/components/ui/ScrollArea'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { BreakdownDialog } from '@/containers/BreakdownDialog'
import { CalorieEstimate } from '@/containers/CalorieEstimate/CalorieEstimate'
import { useTripPacks } from '@/hooks/useTripPacks'
import { useUser } from '@/hooks/useUser'
import { groupByCategory } from '@/lib/categorize'
import {
  formatDateRange,
  labelFor,
  PACE_OPTIONS,
  TEMP_CATEGORY_OPTIONS,
  TERRAIN_OPTIONS,
} from '@/lib/tripDetails'
import {
  calculateCategoryWeights,
  calculateWeightBreakdown,
  getConversionUnit,
  sumPackItemCalories,
  WeightBreakdown,
} from '@/lib/weight'
import { PackItem } from '@/types/pack'
import { Trip } from '@/types/trip'

interface Props {
  trip: Trip
  onEditDetails: () => void
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

export const TripSidebar: FC<Props> = ({ trip, onEditDetails }) => {
  const user = useUser()
  const { packs, displayUnitSystem } = useTripPacks(
    useShallow(store => ({ packs: store.packs, displayUnitSystem: store.displayUnitSystem }))
  )

  const isEnriching =
    trip.enrich_status === 'pending' || trip.enrich_status === 'processing'

  const tempUnit = user.unit_temperature === 'C' ? '°C' : '°F'
  const distUnit = user.unit_distance

  const tempValue =
    trip.temp_min != null || trip.temp_max != null
      ? `${trip.temp_min ?? '—'}${tempUnit} – ${trip.temp_max ?? '—'}${tempUnit}`
      : null

  const detailRows: { label: string; value: string | null }[] = [
    { label: 'Location', value: trip.location || null },
    { label: 'Dates', value: formatDateRange(trip.start_date, trip.end_date) },
    { label: 'Distance', value: trip.distance ? `${trip.distance} ${distUnit}` : null },
    { label: 'Elevation', value: trip.daily_elevation_gain ? `${trip.daily_elevation_gain} ft/day` : null },
    { label: 'Temperature', value: tempValue },
    { label: 'Terrain', value: labelFor(trip.terrain, TERRAIN_OPTIONS) },
    { label: 'Pace', value: labelFor(trip.pace, PACE_OPTIONS) },
    { label: 'Conditions', value: labelFor(trip.temp_category, TEMP_CATEGORY_OPTIONS) },
  ].filter((row): row is { label: string; value: string } => row.value != null)

  const unit = getConversionUnit(displayUnitSystem ?? user.unit_weight)

  const totals = useMemo(() => {
    const breakdowns = packs.map(({ items }) => ({
      weights: calculateWeightBreakdown(items, unit),
      calories: sumPackItemCalories(items),
    }))
    return {
      weights: breakdowns.reduce<WeightBreakdown>(
        (acc, { weights }) => ({
          worn: acc.worn + weights.worn,
          consumable: acc.consumable + weights.consumable,
          total: acc.total + weights.total,
          base: acc.base + weights.base,
        }),
        { worn: 0, consumable: 0, total: 0, base: 0 }
      ),
      calories: breakdowns.reduce((acc, { calories }) => acc + calories, 0),
    }
  }, [packs, unit])

  const allItems = useMemo(() => packs.flatMap(p => p.items), [packs])
  const totalCategoryWeights = useMemo(
    () => categorizePackItems(allItems, unit),
    [allItems, unit]
  )

  const w = totals.weights

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm font-semibold truncate">{trip.title}</h2>
            {isEnriching && (
              <Tooltip>
                <TooltipTrigger>
                  <Loader2 size={14} className="animate-spin text-muted-foreground shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="right">Analyzing trail data...</TooltipContent>
              </Tooltip>
            )}
          </div>
          <button
            type="button"
            onClick={onEditDetails}
            className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <Pencil size={11} />
            Edit
          </button>
        </div>
        {trip.notes && <NotesField text={trip.notes} />}
      </SidebarHeader>

      <SidebarSeparator className="mx-4" />

      <SidebarContent className="overflow-hidden">
        <ScrollArea className="flex-1 min-h-0">
          <SidebarGroup>
            <SidebarGroupContent>
              {detailRows.length > 0 && (
                <div className="text-xs space-y-2.5 px-2">
                  {detailRows.map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-muted-foreground">{label}</p>
                      <p className="font-medium text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarSeparator className="mx-4" />

      <SidebarFooter className="p-3 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold inline-flex items-center gap-1.5">
              <Scale size={14} className="text-primary" />
              Total Weight
            </div>
            {totalCategoryWeights.length > 0 && (
              <BreakdownDialog data={totalCategoryWeights} label="View" />
            )}
          </div>
          <div className="text-xs rounded-lg border border-border bg-muted/30 overflow-hidden">
            <div className="px-3 py-1.5 space-y-0.5">
              <div className="flex justify-between py-0.5">
                <p className="text-muted-foreground">Base</p>
                <p>{w.base.toFixed(2)} {unit}</p>
              </div>
              <div className="flex justify-between py-0.5">
                <p className="text-muted-foreground">Worn</p>
                <p>{w.worn.toFixed(2)} {unit}</p>
              </div>
              <div className="flex justify-between py-0.5">
                <p className="text-muted-foreground">Consumable</p>
                <p>{w.consumable.toFixed(2)} {unit}</p>
              </div>
              <div className="flex justify-between py-0.5 border-t border-border mt-1 pt-1">
                <p className="font-semibold">Total</p>
                <p className="font-semibold">{w.total.toFixed(2)} {unit}</p>
              </div>
            </div>
          </div>
        </div>

        <CalorieEstimate trip={trip} />
      </SidebarFooter>
    </Sidebar>
  )
}

function NotesField({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)

  const measuredRef = useCallback((node: HTMLParagraphElement | null) => {
    if (node) {
      setClamped(node.scrollHeight > node.clientHeight)
    }
  }, [])

  return (
    <div className="mt-1">
      <p
        ref={measuredRef}
        className={`text-xs text-muted-foreground ${expanded ? '' : 'line-clamp-3'}`}
      >
        {text}
      </p>
      {(clamped || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="text-xs text-primary hover:underline mt-0.5"
        >
          {expanded ? 'read less...' : 'read more...'}
        </button>
      )}
    </div>
  )
}
