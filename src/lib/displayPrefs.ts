import { create } from 'zustand'

import { SYSTEM_UNIT } from '@/lib/consts'
import { getHideCalories, setHideCalories } from '@/lib/preferences'

/**
 * View options shared by the gear closet and pack pages, so flipping one in
 * either page's Options menu flips it in both. Read weights through
 * useWeightSystem (hooks/useDisplayPrefs), which applies the account default.
 */
type DisplayPrefsState = {
  /**
   * Metric/imperial override for weights. null follows the account setting.
   * Session-only on purpose: a reload (or saving Settings) goes back to the
   * account setting, which stays the source of truth.
   */
  weightSystem: SYSTEM_UNIT | null
  /** Calorie column in both tables. Persisted per browser. */
  showCalories: boolean
  setWeightSystem: (system: SYSTEM_UNIT | null) => void
  toggleShowCalories: () => void
}

export const useDisplayPrefs = create<DisplayPrefsState>(set => ({
  weightSystem: null,
  showCalories: !getHideCalories(),
  setWeightSystem: weightSystem => set({ weightSystem }),
  toggleShowCalories: () =>
    set(state => {
      setHideCalories(state.showCalories)
      return { showCalories: !state.showCalories }
    }),
}))
