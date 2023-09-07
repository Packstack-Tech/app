import { FC, useMemo } from "react"
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
import { Button } from "@/components/ui"
import { useCreateTrip, useUpdateTrip } from "@/queries/trip"
import { EmptyState } from "@/components/EmptyState"

type Props = {
  editing?: boolean
}

export const PackingList: FC<Props> = ({ editing }) => {
  const { data } = useUserQuery()
  const { isPending: creatingTrip } = useCreateTrip()
  const { isPending: updatingTrip } = useUpdateTrip()
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

  const tableCols = useMemo(
    () => columns(data?.currency || getCurrency("USD")),
    [data?.currency]
  )

  const categorizedItems = useCategorizedPackItems(packs[selectedIndex].items)

  return (
    <div>
      <div className="mb-2 flex gap-4 justify-between">
        <PackTabs packs={availablePacks} />
        {!editing && (
          <Button
            type="submit"
            form="pack-form"
            variant="secondary"
            disabled={creatingTrip || updatingTrip}
          >
            Save
          </Button>
        )}
      </div>
      <div className="flex gap-4 items-center border rounded-sm border-slate-900 mb-2 p-2">
        <div className="flex gap-1.5">
          <Checkbox
            checked={checklistMode}
            id="pack-checklist"
            onClick={() => toggleChecklistMode()}
          />
          <Label id="pack-checklist" className="font-normal text-xs mb-0">
            Display checklist
          </Label>
        </div>
      </div>
      {categorizedItems.length === 0 && (
        <EmptyState subheading="Empty pack" heading="Add gear to your pack">
          <p>
            Use the inventory sidebar on the right to add gear to your pack.
          </p>
        </EmptyState>
      )}
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
