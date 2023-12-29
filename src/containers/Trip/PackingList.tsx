import { FC, useMemo } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Link } from 'lucide-react'
import { shallow } from 'zustand/shallow'

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
      state => ({
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

  const tableCols = useMemo(() => columns(user.currency), [user.currency])

  const categorizedItems = useCategorizedPackItems(packs[selectedIndex].items)
  const categorizedWeights = useCategorizedWeights(categorizedItems)

  return (
    <div>
      <div className="mb-2 flex gap-4 justify-between">
        <PackTabs packs={availablePacks} />
        {!trip && (
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
      <div className="flex items-center justify-between border rounded-sm border-slate-900 mb-2 p-2">
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
        <div className="flex items-center gap-3">
          <BreakdownDialog data={categorizedWeights} />
          {!!trip && (
            <CopyToClipboard
              text={`https://packstack.io/pack/${trip.uuid}`}
              onCopy={() => {
                Mixpanel.track('Trip:Copy shareable link', { id: trip.uuid })
                toast({
                  title: 'Link copied',
                  duration: 1000,
                })
              }}
            >
              <button className="flex gap-1 text-xs items-center text-primary active:text-white">
                <Link width={10} />
                Copy shareable link
              </button>
            </CopyToClipboard>
          )}
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
