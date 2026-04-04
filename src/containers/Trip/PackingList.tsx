import { FC, useMemo } from 'react'
import { CheckSquare, Download, Link, PackageOpen, Settings } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import { EmptyState } from '@/components/EmptyState'
import { CategorizedPackItemsTable } from '@/components/Tables/CategorizedPackItemsTable'
import { Button } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useCategorizedPackItems } from '@/hooks/useCategorizedPackItems'
import { useToast } from '@/hooks/useToast'
import { useTripPacks } from '@/hooks/useTripPacks'
import { useUser } from '@/hooks/useUser'
import { downloadPackingListCsv } from '@/lib/download'
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

  const currentPack = packs[selectedIndex]
  const isSavedPack = !!currentPack?.id

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

  const categorizedItems = useCategorizedPackItems(packs[selectedIndex]?.items ?? [])

  return (
    <div>
      <div className="mb-4 flex gap-4 justify-between items-center">
        <PackTabs packs={availablePacks} />
        <div className="flex items-center gap-2">
          {isSavedPack && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings size={14} />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={e => {
                    e.preventDefault()
                    toggleChecklistMode()
                  }}
                >
                  <CheckSquare size={14} />
                  Checklist mode
                  <span
                    role="switch"
                    aria-checked={checklistMode}
                    className="ml-auto relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors bg-input data-[state=checked]:bg-primary"
                    data-state={checklistMode ? 'checked' : 'unchecked'}
                  >
                    <span
                      className="pointer-events-none block h-3.5 w-3.5 rounded-full bg-background shadow-sm transition-transform translate-x-0.5 data-[state=checked]:translate-x-4"
                      data-state={checklistMode ? 'checked' : 'unchecked'}
                    />
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    downloadPackingListCsv(currentPack.items, {
                      currency: user.currency,
                      title: currentPack.title,
                    })
                    Mixpanel.track('Trip:Export packing list', {
                      packId: currentPack.id,
                    })
                  }}
                >
                  <Download size={14} />
                  Export packing list
                </DropdownMenuItem>
                {!!trip && (
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://packstack.io/pack/${trip.uuid}`
                      )
                      Mixpanel.track('Trip:Copy shareable link', {
                        id: trip.uuid,
                      })
                      toast({ title: 'Link copied', duration: 1000 })
                    }}
                  >
                    <Link size={14} />
                    Copy shareable link
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
