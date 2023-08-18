import { useMemo } from "react"
import { shallow } from "zustand/shallow"
import { useCategorizedPackItems } from "@/hooks/useCategorizedPackItems"
import { useTripPacks } from "@/hooks/useTripPacks"
import { CategorizedPackItemsTable } from "@/components/Tables/CategorizedPackItemsTable"
import { Checkbox } from "@/components/ui/Checkbox"
import { Label } from "@/components/ui/Label"

import { columns } from "./columns"
import { PackTabs } from "../PackTabs/PackTabs"

export const PackingList = () => {
  const { packs, selectedIndex, checklistMode, toggleChecklistMode } =
    useTripPacks(
      (state) => ({
        packs: state.packs,
        selectedIndex: state.selectedIndex,
        checklistMode: state.checklistMode,
        toggleChecklistMode: state.toggleChecklistMode,
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

  const categorizedItems = useCategorizedPackItems(packs[selectedIndex].items)

  return (
    <div>
      <div className="mb-4">
        <PackTabs packs={availablePacks} />
      </div>
      <div className="flex my-2 gap-1.5 items-top">
        <Checkbox
          checked={checklistMode}
          id="pack-checklist"
          onClick={() => toggleChecklistMode()}
        />
        <Label id="pack-checklist" className="font-normal">
          Display checklist
        </Label>
      </div>
      {categorizedItems.map(({ category, items }) => {
        const categoryName = category?.category?.name || "Uncategorized"
        return (
          <CategorizedPackItemsTable
            columns={columns}
            key={categoryName}
            category={categoryName}
            data={items}
          />
        )
      })}
    </div>
  )
}
