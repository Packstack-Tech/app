import type { HikerProfile } from '@/types/hiker-profile'
import type { Trip } from '@/types/trip'
import type { CalcInputs, BodyType, Sex, TerrainType, PaceLevel, TempCategory } from './calorieCalculator'
import { lbToKg, inToCm, miToKm, ftToM } from './calorieCalculator'

export type MissingField = {
  field: string
  label: string
  source: 'profile' | 'trip'
}

const BODY_TYPE_MAP: Record<string, BodyType> = {
  average: 'average',
  muscular: 'high_muscle',
}

const VALID_TERRAIN: Set<string> = new Set(['paved', 'gravel', 'rugged', 'sand', 'swamp'])
const VALID_PACE: Set<string> = new Set(['easy', 'moderate', 'fast'])
const VALID_TEMP: Set<string> = new Set(['cold', 'moderate', 'hot'])

export function getMissingCalorieInputs(
  profile: HikerProfile | null | undefined,
  trip: Trip | undefined,
): MissingField[] {
  const missing: MissingField[] = []

  if (!profile) {
    missing.push({ field: 'profile', label: 'Hiker profile', source: 'profile' })
    return missing
  }

  if (!profile.sex) missing.push({ field: 'sex', label: 'Sex', source: 'profile' })
  if (!profile.weight) missing.push({ field: 'weight', label: 'Weight', source: 'profile' })
  if (!profile.height) missing.push({ field: 'height', label: 'Height', source: 'profile' })
  if (!profile.year_of_birth) missing.push({ field: 'year_of_birth', label: 'Year of birth', source: 'profile' })

  if (!trip?.distance) missing.push({ field: 'distance', label: 'Distance', source: 'trip' })
  if (!trip?.terrain || !VALID_TERRAIN.has(trip.terrain)) missing.push({ field: 'terrain', label: 'Terrain', source: 'trip' })
  if (!trip?.pace || !VALID_PACE.has(trip.pace)) missing.push({ field: 'pace', label: 'Pace', source: 'trip' })
  if (!trip?.temp_category || !VALID_TEMP.has(trip.temp_category)) missing.push({ field: 'temp_category', label: 'Temperature', source: 'trip' })

  return missing
}

function computeTotalDays(trip: Trip | undefined): number {
  if (!trip?.start_date || !trip?.end_date) return 1
  const start = new Date(trip.start_date)
  const end = new Date(trip.end_date)
  const diffMs = end.getTime() - start.getTime()
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1
  return Math.max(days, 1)
}

export function assembleCalcInputs(
  profile: HikerProfile,
  trip: Trip,
  packWeightInUserUnit: number,
  unitPrefs: { unit_weight: string; unit_distance: string },
  safetyMargin: boolean,
): CalcInputs {
  const isImperial = unitPrefs.unit_weight === 'IMPERIAL'
  const isImperialDist = unitPrefs.unit_distance === 'MI'

  const totalDays = computeTotalDays(trip)

  const weightKg = isImperial ? lbToKg(profile.weight!) : profile.weight!
  const heightCm = isImperial ? inToCm(profile.height!) : profile.height!
  const packWeightKg = isImperial ? lbToKg(packWeightInUserUnit) : packWeightInUserUnit
  const totalDistanceKm = isImperialDist ? miToKm(trip.distance!) : trip.distance!
  const dailyDistanceKm = totalDistanceKm / totalDays
  const dailyElevationGainM = trip.daily_elevation_gain
    ? (isImperialDist ? ftToM(trip.daily_elevation_gain) : trip.daily_elevation_gain)
    : 0

  const age = new Date().getFullYear() - profile.year_of_birth!
  const bodyType: BodyType = BODY_TYPE_MAP[profile.body_type ?? 'average'] ?? 'average'

  return {
    sex: profile.sex as Sex,
    age,
    weightKg,
    heightCm,
    packWeightKg,
    dailyDistanceKm,
    dailyElevationGainM,
    totalDays,
    terrain: trip.terrain as TerrainType,
    pace: trip.pace as PaceLevel,
    temp: trip.temp_category as TempCategory,
    bodyType,
    safetyMargin,
  }
}
