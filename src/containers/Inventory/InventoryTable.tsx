import { useMemo } from 'react'
import { Backpack, SearchX } from 'lucide-react'

import { EmptyState } from '@/components/EmptyState'
import { CategorizedItemsTable } from '@/components/Tables/CategorizedItemsTable'
import { Loading } from '@/components/ui/Loading'
import { useCategorizedItems } from '@/hooks/useCategorizedItems'
import { ItemScores } from '@/hooks/useReplacementScores'
import { useUser } from '@/hooks/useUser'
import { ItemCondition, ItemStatus } from '@/types/item'

import { columns } from './columns'

interface Props {
  searchFilter: string
  isLoading: boolean
  showRemoved: boolean
  selectedIds: Set<number>
  onToggleItem: (id: number) => void
  onToggleCategory: (ids: number[]) => void
  scores: ItemScores
  statusFilter?: ItemStatus | null
  conditionFilter?: ItemCondition | null
  categoryFilter?: string | null
}

export const InventoryTable = ({
  searchFilter,
  isLoading,
  showRemoved,
  selectedIds,
  onToggleItem,
  onToggleCategory,
  scores,
  statusFilter,
  conditionFilter,
  categoryFilter,
}: Props) => {
  const user = useUser()
  const data = useCategorizedItems({ showRemoved })

  const filteredData = useMemo(() => {
    let result = data

    if (categoryFilter) {
      result = result.filter(group => {
        const name = group.category?.category?.name || 'Uncategorized'
        return name === categoryFilter
      })
    }

    if (statusFilter || conditionFilter) {
      result = result
        .map(group => ({
          ...group,
          items: group.items.filter(item => {
            if (statusFilter && (item.status || 'active') !== statusFilter) return false
            if (conditionFilter && item.condition !== conditionFilter) return false
            return true
          }),
        }))
        .filter(group => group.items.length > 0)
    }

    return result
  }, [data, statusFilter, conditionFilter, categoryFilter])

  const tableCols = useMemo(
    () => columns(user.currency, scores),
    [user.currency, scores]
  )

  if (isLoading) {
    return (
      <div className="h-screen">
        <Loading />
      </div>
    )
  }

  const hasFilters = !!statusFilter || !!conditionFilter || !!searchFilter || !!categoryFilter
  const hasAnyItems = data.length > 0

  return (
    <div>
      {filteredData.length === 0 && (
        <div className="mt-6">
          {hasAnyItems || hasFilters ? (
            <EmptyState icon={SearchX} heading="No items match your filters">
              <p>
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
            </EmptyState>
          ) : (
            <EmptyState icon={Backpack} heading="Your gear closet is empty">
              <p>
                Add your gear to start building packing lists with automatic
                weight breakdowns.
              </p>
            </EmptyState>
          )}
        </div>
      )}
      {filteredData.map(({ category, items }) => {
        const categoryName = category?.category?.name || 'Uncategorized'
        return (
          <CategorizedItemsTable
            key={categoryName}
            category={categoryName}
            columns={tableCols}
            data={items}
            searchFilter={searchFilter}
            onSearchFilterChange={() => {}}
            selectedIds={selectedIds}
            onToggleItem={onToggleItem}
            onToggleCategory={onToggleCategory}
          />
        )
      })}
    </div>
  )
}
