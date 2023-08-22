import { useMemo } from "react"
import { shallow } from "zustand/shallow"
import { useCategorizedPackItems } from "@/hooks/useCategorizedPackItems"
import { useTripPacks } from "@/hooks/useTripPacks"
import { CategorizedPackItemsTable } from "@/components/Tables/CategorizedPackItemsTable"
import { Checkbox } from "@/components/ui/Checkbox"
import { Label } from "@/components/ui/Label"

import { columns } from "./columns"
import { PackTabs } from "../PackTabs/PackTabs"
import { useUserQuery } from "@/queries/user"
import { getCurrency } from "@/lib/currencies"

export const PackingList = () => {
  const { data } = useUserQuery()
  const {
    packs,
    selectedIndex,
    checklistMode,
    hideHeaders,
    toggleChecklistMode,
    toggleHideHeaders,
  } = useTripPacks(
    (state) => ({
      packs: state.packs,
      selectedIndex: state.selectedIndex,
      checklistMode: state.checklistMode,
      toggleChecklistMode: state.toggleChecklistMode,
      hideHeaders: state.hideHeaders,
      toggleHideHeaders: state.toggleHideHeaders,
    }),
    shallow
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

  const tableCols = useMemo(
    () => columns(data?.currency || getCurrency("USD")),
    [data?.currency]
  )

  const categorizedItems = useCategorizedPackItems(packs[selectedIndex].items)

  return (
    <div>
      <div className="mb-2">
        <PackTabs packs={availablePacks} />
      </div>
      <div className="flex gap-4 items-center border rounded-sm border-slate-900 mb-2 p-2">
        <div className="flex gap-1.5 items-top">
          <Checkbox
            checked={checklistMode}
            id="pack-checklist"
            onClick={() => toggleChecklistMode()}
          />
          <Label id="pack-checklist" className="font-normal text-xs mb-0">
            Display checklist
          </Label>
        </div>
        <div className="flex gap-1.5 items-top">
          <Checkbox
            checked={hideHeaders}
            id="hide-headers"
            onClick={() => toggleHideHeaders()}
          />
          <Label id="hide-headers" className="font-normal text-xs mb-0">
            Hide table headers
          </Label>
        </div>
      </div>
      {categorizedItems.map(({ category, items }) => {
        const categoryName = category?.category?.name || "Uncategorized"
        return (
          <CategorizedPackItemsTable
            columns={tableCols}
            key={categoryName}
            category={categoryName}
            data={items}
          />
        )
      })}
    </div>
  )
}
