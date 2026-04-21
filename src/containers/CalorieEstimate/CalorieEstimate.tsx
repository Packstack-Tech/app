import { FC, useMemo, useState } from 'react'
import { DropletIcon, FlameIcon, InfoIcon } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useTripPacks } from '@/hooks/useTripPacks'
import { useUser } from '@/hooks/useUser'
import {
  assembleCalcInputs,
  getMissingCalorieInputs,
} from '@/lib/calorieAssembler'
import { calculateDailyCalories } from '@/lib/calorieCalculator'
import { calculateWeightBreakdown } from '@/lib/weight'
import { useHikerProfilesQuery } from '@/queries/hiker-profile'
import { Trip } from '@/types/trip'

interface Props {
  trip: Trip
}

export const CalorieEstimate: FC<Props> = ({ trip }) => {
  const user = useUser()
  const { packs } = useTripPacks(useShallow(store => ({ packs: store.packs })))
  const { data: profiles } = useHikerProfilesQuery()

  const defaultProfile = profiles?.find(p => p.is_default) ?? profiles?.[0]
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>(undefined)

  const activeProfile = useMemo(() => {
    if (!profiles?.length) return null
    if (selectedProfileId) return profiles.find(p => p.id === Number(selectedProfileId)) ?? null
    return defaultProfile ?? null
  }, [profiles, selectedProfileId, defaultProfile])

  const relevantProfiles = useMemo(() => {
    if (!profiles?.length) return []
    const assignedIds = new Set(
      packs.map(p => p.hiker_profile_id).filter((id): id is number => id != null),
    )
    if (assignedIds.size === 0) return profiles
    return profiles.filter(p => assignedIds.has(p.id))
  }, [profiles, packs])

  const showProfileSelector = relevantProfiles.length > 1

  const [safetyMargin, setSafetyMargin] = useState(false)

  const packsForProfile = useMemo(() => {
    if (!activeProfile) return packs
    return packs.filter(
      p => p.hiker_profile_id === activeProfile.id || !p.hiker_profile_id,
    )
  }, [packs, activeProfile])

  const totalPackWeight = useMemo(() => {
    const allItems = packsForProfile.flatMap(p => p.items)
    return calculateWeightBreakdown(allItems, user.conversion_unit).total
  }, [packsForProfile, user.conversion_unit])

  const missing = useMemo(
    () => getMissingCalorieInputs(activeProfile, trip),
    [activeProfile, trip],
  )

  const results = useMemo(() => {
    if (missing.length > 0 || !activeProfile) return null
    const inputs = assembleCalcInputs(
      activeProfile,
      trip,
      totalPackWeight,
      { unit_weight: user.unit_weight, unit_distance: user.unit_distance },
      safetyMargin,
    )
    return calculateDailyCalories(inputs)
  }, [missing, activeProfile, trip, totalPackWeight, user, safetyMargin])

  const isMetric = user.unit_weight === 'METRIC'
  const foodWeightUnit = isMetric ? 'kg' : 'lb'

  const totalDays = useMemo(() => {
    if (!trip.start_date || !trip.end_date) return 1
    const diffMs = new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()
    return Math.max(Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1, 1)
  }, [trip.start_date, trip.end_date])

  return (
    <div>
      <div className="text-sm font-semibold mb-2 inline-flex items-center gap-1.5">
        <FlameIcon size={14} className="text-orange-400" />
        Calorie Estimate
      </div>

      <div className="text-sm rounded-lg border border-border bg-muted/30 overflow-hidden">
        {/* Profile selector */}
        <div className="px-3 py-2 border-b border-border bg-muted/50">
          {profiles && profiles.length > 0 ? (
            showProfileSelector ? (
              <Select
                value={selectedProfileId ?? String(activeProfile?.id ?? '')}
                onValueChange={setSelectedProfileId}
              >
                <SelectTrigger size="sm" className="w-full text-xs">
                  <SelectValue placeholder="Select profile..." />
                </SelectTrigger>
                <SelectContent>
                  {relevantProfiles.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-muted-foreground">
                {activeProfile?.name}
              </p>
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              <a href="/settings" className="text-primary hover:underline">
                Create a hiker profile
              </a>{' '}
              to estimate calories.
            </p>
          )}
        </div>

        <div className="px-3 py-1.5">
          {missing.length > 0 ? (
            <div className="py-2 space-y-1.5">
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <InfoIcon size={12} className="mt-0.5 shrink-0" />
                Missing data for estimate:
              </p>
              {missing.map(m => (
                <div key={m.field} className="flex justify-between text-xs py-0.5">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="text-muted-foreground/70">
                    {m.source === 'profile' ? 'Hiker profile' : 'Trip details'}
                  </span>
                </div>
              ))}
            </div>
          ) : results ? (
            <div className="space-y-0.5">
              {/* Daily total */}
              <div className="flex justify-between py-0.5 border-b border-border mt-0.5 pb-1">
                <p className="font-semibold text-orange-400 inline-flex items-center gap-1">
                  <FlameIcon size={13} />
                  Daily
                </p>
                <p className="font-semibold text-orange-400">
                  {results.totalDailyKcal.toLocaleString()} kcal
                </p>
              </div>

              <div className="flex justify-between py-0.5">
                <p className="text-muted-foreground">Food / day</p>
                <p>
                  {isMetric
                    ? `${(results.foodLbPerDay * 0.453592).toFixed(2)} ${foodWeightUnit}`
                    : `${results.foodLbPerDay} ${foodWeightUnit}`}
                </p>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-1 py-1">
                <div className="bg-muted/50 rounded px-1.5 py-1 text-center">
                  <p className="text-[10px] text-muted-foreground">Carbs</p>
                  <p className="text-xs font-medium">{results.carbsG}g</p>
                </div>
                <div className="bg-muted/50 rounded px-1.5 py-1 text-center">
                  <p className="text-[10px] text-muted-foreground">Fat</p>
                  <p className="text-xs font-medium">{results.fatG}g</p>
                </div>
                <div className="bg-muted/50 rounded px-1.5 py-1 text-center">
                  <p className="text-[10px] text-muted-foreground">Protein</p>
                  <p className="text-xs font-medium">{results.proteinG}g</p>
                </div>
              </div>

              <div className="flex justify-between py-0.5">
                <p className="text-muted-foreground">Hiking time</p>
                <p>{results.hikingHours} hrs</p>
              </div>
              <div className="flex justify-between py-0.5">
                <p className="text-muted-foreground">Burn rate</p>
                <p>{results.hikingKcalPerHour.toLocaleString()} kcal/hr</p>
              </div>
              <div className="flex justify-between py-0.5">
                <p className="text-muted-foreground inline-flex items-center gap-1">
                  <DropletIcon size={11} />
                  Water
                </p>
                <p>{results.waterLitersPerDay} L/day</p>
              </div>

              {/* Trip total */}
              {totalDays > 1 && (
                <>
                  <div className="flex justify-between py-0.5 border-t border-border mt-1 pt-1">
                    <p className="text-muted-foreground">
                      Trip total ({totalDays}d)
                    </p>
                    <p className="font-medium">
                      {results.totalTripKcal.toLocaleString()} kcal
                    </p>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <p className="text-muted-foreground">Total food</p>
                    <p>
                      {isMetric
                        ? `${(results.totalTripFoodLb * 0.453592).toFixed(2)} ${foodWeightUnit}`
                        : `${results.totalTripFoodLb} ${foodWeightUnit}`}
                    </p>
                  </div>
                </>
              )}

              {/* Safety margin toggle */}
              <div className="flex justify-between items-center py-1 border-t border-border mt-1 pt-1.5">
                <label
                  htmlFor="safety-margin"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  +10% safety margin
                </label>
                <input
                  id="safety-margin"
                  type="checkbox"
                  checked={safetyMargin}
                  onChange={e => setSafetyMargin(e.target.checked)}
                  className="accent-primary h-3.5 w-3.5 cursor-pointer"
                />
              </div>

              {safetyMargin && (
                <p className="text-[10px] text-orange-400/70 pb-0.5">
                  Includes +10% safety margin
                </p>
              )}
            </div>
          ) : null}
        </div>
        <div className="px-3 py-2 border-t border-border">
          <a
            href="https://www.packstack.io/tools/backpacking-calorie-calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            How is this calculated?
          </a>
        </div>
      </div>
    </div>
  )
}
