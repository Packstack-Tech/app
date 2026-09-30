import { createContext, useContext } from 'react'

import { Overpack } from '@/hooks/useOverpack'
import { DEFAULT_OVERPACK_SETTINGS } from '@/lib/overpack'

/**
 * Over-pack status for the trip, computed once at the list level
 * (see useOverpack) and provided so each cell reads its own row without
 * recomputing the whole map per row.
 */
export const OverpackContext = createContext<Overpack>({
  settings: DEFAULT_OVERPACK_SETTINGS,
  byItem: new Map(),
  overCount: 0,
  canSet: () => true,
  maxFor: (_id, _idx, owned) => owned,
})

export const useOverpackContext = () => useContext(OverpackContext)
