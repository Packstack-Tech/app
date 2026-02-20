import { useMemo } from 'react'
import { Backpack } from 'lucide-react'

import { EmptyState } from '@/components/EmptyState'
import { CategorizedItemsTable } from '@/components/Tables/CategorizedItemsTable'
import { Loading } from '@/components/ui/Loading'
import { useCategorizedItems } from '@/hooks/useCategorizedItems'
import { useUser } from '@/hooks/useUser'

import { columns } from './columns'

interface Props {
  searchFilter: string
  isLoading: boolean
  showRemoved: boolean
  selectedIds: Set<number>
  onToggleItem: (id: number) => void
  onToggleCategory: (ids: number[]) => void
}

export const InventoryTable = ({
  searchFilter,
  isLoading,
  showRemoved,
  selectedIds,
  onToggleItem,
  onToggleCategory,
}: Props) => {
  const user = useUser()
  const data = useCategorizedItems({ showRemoved })

  const tableCols = useMemo(() => columns(user.currency), [user.currency])

  if (isLoading) {
    return (
      <div className="h-screen">
        <Loading />
      </div>
    )
  }

  return (
    <div>
      {data.length === 0 && (
        <div className="mt-6">
          <EmptyState icon={Backpack} heading="Your inventory is empty">
            <p>
              Add your gear to start building packing lists with automatic
              weight breakdowns.
            </p>
          </EmptyState>
        </div>
      )}
      {data.map(({ category, items }) => {
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
