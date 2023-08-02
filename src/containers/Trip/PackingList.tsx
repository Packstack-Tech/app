'use client'

import { shallow } from 'zustand/shallow'
import { useCategorizedPackItems } from '@/hooks/useCategorizedPackItems'
import { useTripPacks } from '@/hooks/useTripPacks'
import { CategorizedPackItemsTable } from '@/components/Tables/CategorizedPackItemsTable'
import { columns } from './columns'
import { PackTabs } from '../PackTabs/PackTabs'
import { useMemo } from 'react'

export const PackingList = () => {
  const { packs, selectedIndex } = useTripPacks(
    (state) => ({
      packs: state.packs,
      selectedIndex: state.selectedIndex
    }),
    shallow
  )

  const availablePacks = useMemo(() => {
    return packs.map(({ id, title }, idx) => ({
      index: idx,
      id,
      title
    }))
  }, [packs])

  const categorizedItems = useCategorizedPackItems(packs[selectedIndex].items)

  return (
    <div>
      <div>
        <PackTabs packs={availablePacks} />
      </div>
      {categorizedItems.map(({ category, items }) => {
        const categoryName = category?.category?.name || 'Uncategorized'
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
