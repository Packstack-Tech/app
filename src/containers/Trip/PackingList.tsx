import { FC, useMemo } from 'react'
import { Link, PackageOpen } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import { EmptyState } from '@/components/EmptyState'
import { CategorizedPackItemsTable } from '@/components/Tables/CategorizedPackItemsTable'
import { Button } from '@/components/ui'
import { Checkbox } from '@/components/ui/Checkbox'
import { Label } from '@/components/ui/Label'
import { BreakdownDialog } from '@/containers/BreakdownDialog'
import { useCategorizedPackItems } from '@/hooks/useCategorizedPackItems'
import { useCategorizedWeights } from '@/hooks/useCategorizedWeights'
import { useToast } from '@/hooks/useToast'
import { useTripPacks } from '@/hooks/useTripPacks'
import { useUser } from '@/hooks/useUser'
import { Mixpanel } from '@/lib/mixpanel'
import { useCreateTrip, useUpdateTrip } from '@/queries/trip'
import { Trip } from '@/types/trip'

import { PackTabs } from '../PackTabs/PackTabs'
import { columns } from './columns'

type Props = {
  trip?: Trip
}

export const PackingList: FC<Props> = ({ trip }) => {
  const user = useUser()
  const { toast } = useToast()
  const { isPending: creatingTrip } = useCreateTrip()
  const { isPending: updatingTrip } = useUpdateTrip()
  const { packs, selectedIndex, checklistMode, toggleChecklistMode } =
    useTripPacks(
      useShallow(state => ({
        packs: state.packs,
        selectedIndex: state.selectedIndex,
        checklistMode: state.checklistMode,
        toggleChecklistMode: state.toggleChecklistMode,
      }))
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

  const tableCols = useMemo(() => columns(user.currency), [user.currency])

  const categorizedItems = useCategorizedPackItems(packs[selectedIndex].items)
  const categorizedWeights = useCategorizedWeights(categorizedItems)

  return (
    <div>
      <div className="mb-4 flex gap-4 justify-between items-center">
        <PackTabs packs={availablePacks} />
        {!trip && (
          <Button
            type="submit"
            size="lg"
            form="pack-form"
            disabled={creatingTrip || updatingTrip}
          >
            Save
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between border rounded-sm border-slate-100 dark:border-slate-900 mb-4 p-3">
        <div className="flex gap-1.5">
          <Checkbox
            checked={checklistMode}
            id="pack-checklist"
            onClick={() => toggleChecklistMode()}
          />
          <Label id="pack-checklist" className="font-normal text-xs mb-0">
            Checklist mode
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <BreakdownDialog data={categorizedWeights} />
          {!!trip && (
            <button
              className="flex gap-1 text-xs items-center text-primary active:text-white"
              onClick={() => {
                navigator.clipboard.writeText(`https://packstack.io/pack/${trip.uuid}`)
                Mixpanel.track('Trip:Copy shareable link', { id: trip.uuid })
                toast({
                  title: 'Link copied',
                  duration: 1000,
                })
              }}
            >
              <Link width={10} />
              Copy shareable link
            </button>
          )}
        </div>
      </div>
      {categorizedItems.length === 0 && (
        <EmptyState icon={PackageOpen} heading="Your pack is empty">
          <p>
            Browse your inventory on the right and click items to add them to
            this pack.
          </p>
        </EmptyState>
      )}
      {categorizedItems.map(({ category, items }) => {
        const categoryName = category?.category?.name || 'Uncategorized'
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
