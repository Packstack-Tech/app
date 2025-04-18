import { useMemo } from 'react'

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
}

export const InventoryTable = ({
  searchFilter,
  isLoading,
  showRemoved,
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
        <div className="max-w-lg mx-auto mt-6">
          <EmptyState
            subheading="Inventory"
            heading="Add gear to your inventory"
          >
            <p>
              Your inventory is a collection of all the gear you own.
              Categorizing your gear makes it easier to find, and also allows us
              to create comprehensive weight breakdowns for you.
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
          />
        )
      })}
    </div>
  )
}
