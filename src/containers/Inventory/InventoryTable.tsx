import { FC, useMemo } from "react"

import { useCategorizedItems } from "@/hooks/useCategorizedItems"
import { CategorizedItemsTable } from "@/components/Tables/CategorizedItemsTable"
import { columns } from "./columns"
import { useUserQuery } from "@/queries/user"
import { getCurrency } from "@/lib/currencies"

type Props = {
  searchFilter?: string
  onSearchFilterChange?: (value: string) => void
}

export const InventoryTable: FC<Props> = ({
  searchFilter,
  onSearchFilterChange,
}) => {
  const { data: userData } = useUserQuery()
  const data = useCategorizedItems({})

  const tableCols = useMemo(
    () => columns(userData?.currency || getCurrency("USD")),
    [userData?.currency]
  )

  return (
    <div>
      {(data || []).map(({ category, items }) => {
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
