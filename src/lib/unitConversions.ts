// Distance
export const miToKm = (mi: number) => mi * 1.60934
export const kmToMi = (km: number) => km / 1.60934

// Elevation
export const ftToM = (ft: number) => ft * 0.3048
export const mToFt = (m: number) => m / 0.3048

// Temperature
export const cToF = (c: number) => (c * 9) / 5 + 32
export const fToC = (f: number) => ((f - 32) * 5) / 9

// Speed
export const mphToKmh = (mph: number) => mph * 1.60934
export const kmhToMph = (kmh: number) => kmh / 1.60934
export const mphToMs = (mph: number) => mph * 0.44704

// Weight & height
export const lbToKg = (lb: number) => lb * 0.453592
export const kgToLb = (kg: number) => kg / 0.453592
export const inToCm = (inches: number) => inches * 2.54
export const cmToIn = (cm: number) => cm / 2.54
