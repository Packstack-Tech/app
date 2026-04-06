export type Sex = "male" | "female"
export type TerrainType = "paved" | "gravel" | "rugged" | "sand" | "swamp"
export type PaceLevel = "easy" | "moderate" | "fast"
export type TempCategory = "cold" | "moderate" | "hot"
export type BodyType = "average" | "high_muscle"

export const TERRAIN_COEFFICIENTS: Record<TerrainType, number> = {
  paved: 1.0,
  gravel: 1.2,
  rugged: 1.5,
  sand: 2.1,
  swamp: 3.5,
}

export const TERRAIN_LABELS: Record<TerrainType, string> = {
  paved: "Paved Road (1.0)",
  gravel: "Gravel / Dirt Trail (1.2)",
  rugged: "Rugged / Loose Rock (1.5)",
  sand: "Sand (2.1)",
  swamp: "Swamp / Bog (3.5)",
}

export const PACE_MPH: Record<PaceLevel, number> = {
  easy: 2,
  moderate: 3,
  fast: 4,
}

export const PACE_LABELS: Record<PaceLevel, string> = {
  easy: "Easy (2 mph)",
  moderate: "Moderate (3 mph)",
  fast: "Fast (4 mph)",
}

export const TEMP_LABELS: Record<TempCategory, string> = {
  cold: "Cold (< 32°F / 0°C)",
  moderate: "Moderate (32–85°F / 0–29°C)",
  hot: "Hot (> 85°F / 29°C)",
}

export const BODY_TYPE_MULTIPLIERS: Record<BodyType, number> = {
  average: 1.0,
  high_muscle: 1.1,
}

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  average: "Average",
  high_muscle: "High Muscle Mass",
}

const FOOD_DENSITY_KCAL_PER_OZ = 130
const SEDENTARY_FACTOR = 1.2

const WATER_TEMP_MODIFIER: Record<TempCategory, number> = {
  cold: 1.0,
  moderate: 1.0,
  hot: 1.5,
}

// ── Unit conversions ──

export const lbToKg = (lb: number) => lb * 0.453592
export const kgToLb = (kg: number) => kg / 0.453592
export const inToCm = (inches: number) => inches * 2.54
export const cmToIn = (cm: number) => cm / 2.54
export const miToKm = (mi: number) => mi * 1.60934
export const kmToMi = (km: number) => km / 1.60934
export const ftToM = (ft: number) => ft * 0.3048
export const mToFt = (m: number) => m / 0.3048
export const mphToMs = (mph: number) => mph * 0.44704

// ── Step A: Mifflin-St Jeor BMR ──

export function calculateBMR(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === "male" ? base + 5 : base - 161
}

export function calculateBaselineCalories(bmr: number): number {
  return bmr * SEDENTARY_FACTOR
}

// ── Step B: Pandolf Load Carriage Equation ──
// M (Watts) = 1.5W + 2.0(W+L)(L/W)^2 + η(W+L)(1.5V^2 + 0.35VG)

export function calculatePandolfPower(
  W: number, // body weight kg
  L: number, // load kg
  V: number, // velocity m/s
  G: number, // grade %
  eta: number, // terrain coefficient
): number {
  const wPlusL = W + L
  const lOverW = L / W
  return 1.5 * W + 2.0 * wPlusL * lOverW * lOverW + eta * wPlusL * (1.5 * V * V + 0.35 * V * G)
}

// ── Step C: Conversions & modifiers ──

export function wattsToKcalPerHour(watts: number): number {
  return watts * 0.8604
}

export function calculateGrade(elevationGainM: number, distanceM: number): number {
  if (distanceM <= 0) return 0
  return (elevationGainM / distanceM) * 100
}

export function applyModifiers(
  kcalPerHour: number,
  temp: TempCategory,
  elevationGainFt: number,
): number {
  let modified = kcalPerHour
  if (temp === "cold") modified *= 1.1
  if (temp === "hot") modified *= 1.05
  if (elevationGainFt > 10000) modified *= 1.05
  return modified
}

// ── Step D: Orchestrator ──

export interface CalcInputs {
  sex: Sex
  age: number
  weightKg: number
  heightCm: number
  packWeightKg: number
  dailyDistanceKm: number
  dailyElevationGainM: number
  totalDays: number
  terrain: TerrainType
  pace: PaceLevel
  temp: TempCategory
  bodyType: BodyType
  safetyMargin: boolean
}

export interface CalcResults {
  bmr: number
  baselineDaily: number
  hikingHours: number
  hikingKcalPerHour: number
  hikingKcalPerDay: number
  restKcalPerDay: number
  totalDailyKcal: number
  foodOzPerDay: number
  foodLbPerDay: number
  totalTripKcal: number
  totalTripFoodLb: number
  carbsG: number
  fatG: number
  proteinG: number
  waterLitersPerDay: number
}

export function calculateDailyCalories(inputs: CalcInputs): CalcResults {
  const {
    sex, age, weightKg, heightCm, packWeightKg,
    dailyDistanceKm, dailyElevationGainM, totalDays,
    terrain, pace, temp, bodyType, safetyMargin,
  } = inputs

  // Step A — BMR with body composition modifier
  const rawBmr = calculateBMR(sex, weightKg, heightCm, age)
  const bmr = rawBmr * BODY_TYPE_MULTIPLIERS[bodyType]
  const baselineDaily = calculateBaselineCalories(bmr)

  // Derived values
  const paceMph = PACE_MPH[pace]
  const paceMs = mphToMs(paceMph)
  const dailyDistanceMi = kmToMi(dailyDistanceKm)
  const hikingHours = dailyDistanceMi / paceMph

  // Grade: elevation gain over horizontal distance (both in meters)
  const dailyDistanceM = dailyDistanceKm * 1000
  const grade = calculateGrade(dailyElevationGainM, dailyDistanceM)

  // Step B
  const eta = TERRAIN_COEFFICIENTS[terrain]
  const metabolicWatts = calculatePandolfPower(weightKg, packWeightKg, paceMs, grade, eta)

  // Step C
  let kcalPerHour = wattsToKcalPerHour(metabolicWatts)
  const elevationGainFt = mToFt(dailyElevationGainM)
  kcalPerHour = applyModifiers(kcalPerHour, temp, elevationGainFt)

  // Step D
  const hikingKcalPerDay = kcalPerHour * hikingHours
  const restHours = 24 - hikingHours
  const restKcalPerDay = (baselineDaily / 24) * restHours
  let totalDailyKcal = hikingKcalPerDay + restKcalPerDay

  if (safetyMargin) {
    totalDailyKcal *= 1.1
  }

  const foodOzPerDay = totalDailyKcal / FOOD_DENSITY_KCAL_PER_OZ
  const foodLbPerDay = foodOzPerDay / 16
  const totalTripKcal = totalDailyKcal * totalDays
  const totalTripFoodLb = foodLbPerDay * totalDays

  // Macronutrient breakdown (50% carbs / 30% fat / 20% protein)
  const carbsG = Math.round((totalDailyKcal * 0.5) / 4)
  const fatG = Math.round((totalDailyKcal * 0.3) / 9)
  const proteinG = Math.round((totalDailyKcal * 0.2) / 4)

  // Water estimation: 0.5 L/hr hiking (modified by temp & terrain effort) + 1.5 L rest-of-day
  const tempWaterMod = WATER_TEMP_MODIFIER[temp]
  const effortMod = Math.sqrt(eta)
  const waterLitersPerDay = Math.round(
    (hikingHours * 0.5 * tempWaterMod * effortMod + 1.5) * 10,
  ) / 10

  return {
    bmr: Math.round(bmr),
    baselineDaily: Math.round(baselineDaily),
    hikingHours: Math.round(hikingHours * 10) / 10,
    hikingKcalPerHour: Math.round(kcalPerHour),
    hikingKcalPerDay: Math.round(hikingKcalPerDay),
    restKcalPerDay: Math.round(restKcalPerDay),
    totalDailyKcal: Math.round(totalDailyKcal),
    foodOzPerDay: Math.round(foodOzPerDay * 10) / 10,
    foodLbPerDay: Math.round(foodLbPerDay * 100) / 100,
    totalTripKcal: Math.round(totalTripKcal),
    totalTripFoodLb: Math.round(totalTripFoodLb * 100) / 100,
    carbsG,
    fatG,
    proteinG,
    waterLitersPerDay,
  }
}
