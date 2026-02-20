import { useMemo } from 'react'

import { groupByCategory } from '@/lib/categorize'
import { CategoryPackItems } from '@/types/category'
import { PackItem } from '@/types/pack'

export const useCategorizedPackItems = (
  packItems: PackItem[]
): CategoryPackItems[] => {
  return useMemo(
    () =>
      groupByCategory<PackItem>(
        packItems,
        item => item.item.category_id?.toString() || 'uncategorized',
        item => item.item.category,
        item => item.sort_order || 0
      ),
    [packItems]
  )
}
