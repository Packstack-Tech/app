import { useMemo } from 'react'

import { calculateCategoryWeights } from '@/lib/weight'
import { CategoryPackItems, CategoryWeight } from '@/types/category'

import { useUser } from './useUser'

export const useCategorizedWeights = (
  data: CategoryPackItems[]
): CategoryWeight[] => {
  const user = useUser()
  return useMemo(
    () => calculateCategoryWeights(data, user.conversion_unit),
    [data, user.conversion_unit]
  )
}
