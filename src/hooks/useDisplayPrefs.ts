import { useUser } from '@/hooks/useUser'
import { SYSTEM_UNIT } from '@/lib/consts'
import { useDisplayPrefs } from '@/lib/displayPrefs'
import { Mixpanel } from '@/lib/mixpanel'
import { oppositeSystem } from '@/lib/weight'

export { useDisplayPrefs }

/** The unit system weights are shown in right now. */
export function useWeightSystem(): SYSTEM_UNIT {
  const user = useUser()
  const override = useDisplayPrefs(state => state.weightSystem)
  return override ?? user.unit_weight
}

/** Flips weights between metric and imperial for this session. */
export function useToggleWeightSystem(source: 'gear-closet' | 'pack') {
  const user = useUser()
  const system = useWeightSystem()
  const setWeightSystem = useDisplayPrefs(state => state.setWeightSystem)

  return () => {
    const next = oppositeSystem(system)
    // Back on the account setting: drop the override rather than pin it.
    setWeightSystem(next === user.unit_weight ? null : next)
    Mixpanel.track('Weight:UnitsToggled', { to: next, source })
  }
}
