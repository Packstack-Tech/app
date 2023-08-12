import { FC } from "react"

import { useCategorizedItems } from "@/hooks/useCategorizedItems"
import { CategorizedItemsTable } from "@/components/Tables/CategorizedItemsTable"
import { columns } from "./columns"

type Props = {
  searchFilter?: string
  onSearchFilterChange?: (value: string) => void
}

export const InventoryTable: FC<Props> = ({
  searchFilter,
  onSearchFilterChange,
}) => {
  const data = useCategorizedItems()

  return (
    <div>
      {(data || []).map(({ category, items }) => {
        const categoryName = category?.category?.name || "Uncategorized"
        return (
          <CategorizedItemsTable
            key={categoryName}
            category={categoryName}
            columns={columns}
            data={items}
            searchFilter={searchFilter}
            onSearchFilterChange={onSearchFilterChange}
          />
        )
      })}
    </div>
  )
}
