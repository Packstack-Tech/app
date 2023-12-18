import { Unit } from "@/types/item"
import { SYSTEM_UNIT } from "./consts"

export function convertWeight(weight: number, fromUnit: Unit, toUnit: Unit) {
  // Define conversion factors for different weight units
  const conversionFactors: { [K in Unit]: number } = {
    g: 1,
    kg: 1000,
    oz: 28.3495,
    lb: 453.592,
  }

  // Convert the weight to grams (the base unit)
  const weightInGrams = weight * conversionFactors[fromUnit]

  // Convert the weight from grams to the desired output unit
  const convertedWeight = weightInGrams / conversionFactors[toUnit]

  return {
    weight: convertedWeight,
    display: `${convertedWeight.toFixed(2)} ${toUnit}`,
  }
}

export const getConversionUnit = (unit_system: SYSTEM_UNIT) => {
  return unit_system === "METRIC" ? "kg" : "lb"
}
