import { FC } from 'react'
import { MoreVertical, PackageOpen, Users } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import { EmptyState } from '@/components/EmptyState'
import { OverpackBadge } from '@/components/OverpackBadge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { WeightValue } from '@/components/WeightValue'
import {
  AggregatedPackItem,
  useAggregatedPackItems,
} from '@/hooks/useAggregatedPackItems'
import { useWeightSystem } from '@/hooks/useDisplayPrefs'
import { useOverpack } from '@/hooks/useOverpack'
import { useTripPacks } from '@/hooks/useTripPacks'
import { convertWeightValue } from '@/lib/weight'

/**
 * The cross-pack overview, shown when a trip has more than one pack.
 *
 * Read-only apart from removal. Every per-item field the pack view edits
 * (quantity, worn, checked) is per-pack, so an item carried by two people has
 * two values and there is no honest single control for it — editing stays in
 * the individual pack tabs. Removal is the exception because "we're carrying
 * two of these" is the problem this screen exists to reveal, and it has to
 * name which pack to remove from.
 */
export const AggregatedPackList: FC = () => {
  const { groups, itemCount, duplicateCount } = useAggregatedPackItems()
  const overpack = useOverpack()
  const { packs, selectPack, removeItemFromPack } = useTripPacks(
    useShallow(store => ({
      packs: store.packs,
      selectPack: store.selectPack,
      removeItemFromPack: store.removeItemFromPack,
    }))
  )

  const effectiveSystem = useWeightSystem()

  const rowGrams = (row: AggregatedPackItem) =>
    convertWeightValue(row.item.weight || 0, row.item.unit, 'g') *
    row.totalQuantity

  if (itemCount === 0) {
    return (
      <EmptyState icon={PackageOpen} heading="Nothing packed yet">
        <p>Add items to any pack and they'll show up here.</p>
      </EmptyState>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span>
          {itemCount} {itemCount === 1 ? 'item' : 'items'} across {packs.length}{' '}
          packs
        </span>
        {duplicateCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <Users size={12} />
            {duplicateCount} in more than one
          </span>
        )}
      </div>

      {groups.map(group => {
        const categoryName = group.category?.category?.name || 'Uncategorized'
        const categoryGrams = group.items.reduce(
          (sum, row) => sum + rowGrams(row),
          0
        )

        return (
          <div key={categoryName} className="mb-4">
            <div className="flex items-center justify-between bg-muted px-3 py-2">
              <h3 className="text-sm font-semibold text-foreground">
                {categoryName}
              </h3>
              <WeightValue
                className="text-xs text-foreground"
                value={categoryGrams}
                unit="g"
                system={effectiveSystem}
                format="total"
              />
            </div>

            <ul>
              {group.items.map(row => {
                const carriedByMany = row.packs.length > 1
                const weight = rowGrams(row)
                return (
                  <li
                    key={row.item.id}
                    className="flex items-center gap-3 border-b border-border px-3 py-2"
                  >
                    <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-bold text-muted-foreground">
                      {row.totalQuantity}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground">
                          {row.item.name}
                        </span>
                        <OverpackBadge status={overpack.byItem.get(row.item.id)} compact />
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        {carriedByMany && <Users size={11} className="shrink-0" />}
                        <span className="truncate">
                          {row.packs.map(p => p.title).join(' · ')}
                        </span>
                      </div>
                    </div>

                    {weight > 0 && (
                      <WeightValue
                        className="shrink-0 text-xs tabular-nums text-muted-foreground"
                        value={weight}
                        unit="g"
                        system={effectiveSystem}
                        format="total"
                      />
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="shrink-0 cursor-pointer px-1 text-muted-foreground hover:text-foreground">
                          <MoreVertical size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {row.packs.map(p => (
                          <DropdownMenuItem
                            key={`open-${p.index}`}
                            onClick={() => selectPack(p.index)}
                          >
                            Open {p.title}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        {row.packs.map(p => (
                          <DropdownMenuItem
                            key={`remove-${p.index}`}
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              removeItemFromPack(p.index, row.item.id)
                            }
                          >
                            Remove from {p.title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
