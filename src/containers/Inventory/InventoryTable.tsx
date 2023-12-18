import { FC, useMemo } from "react"

import { useCategorizedItems } from "@/hooks/useCategorizedItems"
import { CategorizedItemsTable } from "@/components/Tables/CategorizedItemsTable"
import { columns } from "./columns"

import { EmptyState } from "@/components/EmptyState"
import { useUser } from "@/hooks/useUser"

type Props = {
  searchFilter?: string
  onSearchFilterChange?: (value: string) => void
}

export const InventoryTable: FC<Props> = ({
  searchFilter,
  onSearchFilterChange,
}) => {
  const user = useUser()
  const data = useCategorizedItems({})

  const tableCols = useMemo(() => columns(user.currency), [user.currency])

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
        const categoryName = category?.category?.name || "Uncategorized"
        return (
          <CategorizedItemsTable
            key={categoryName}
            category={categoryName}
            columns={tableCols}
            data={items}
            searchFilter={searchFilter}
            onSearchFilterChange={onSearchFilterChange}
          />
        )
      })}
    </div>
  )
}
