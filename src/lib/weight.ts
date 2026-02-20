import { CategoryPackItems } from '@/types/category'
import { Unit } from '@/types/item'
import { PackItem } from '@/types/pack'

import { SYSTEM_UNIT } from './consts'

const CONVERSION_FACTORS: Record<Unit, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
}

/**
 * Converts a weight value between units.
 * Returns both the numeric value and a formatted display string.
 */
export function convertWeight(weight: number, fromUnit: Unit, toUnit: Unit) {
  const weightInGrams = weight * CONVERSION_FACTORS[fromUnit]
  const convertedWeight = weightInGrams / CONVERSION_FACTORS[toUnit]

  return {
    weight: convertedWeight,
    display: `${convertedWeight.toFixed(2)} ${toUnit}`,
  }
}

/**
 * Converts a weight value between units, returning only the numeric result.
 */
export function convertWeightValue(
  weight: number,
  fromUnit: Unit,
  toUnit: Unit
): number {
  const weightInGrams = weight * CONVERSION_FACTORS[fromUnit]
  return weightInGrams / CONVERSION_FACTORS[toUnit]
}

export const getConversionUnit = (unit_system: SYSTEM_UNIT): Unit => {
  return unit_system === 'METRIC' ? 'kg' : 'lb'
}

/**
 * Sums the total weight of pack items, converting each to the target unit
 * and multiplying by quantity.
 */
export function sumPackItemWeights(
  items: PackItem[],
  toUnit: Unit
): number {
  return items.reduce((total, { item, quantity }) => {
    const converted = convertWeightValue(item.weight || 0, item.unit, toUnit)
    return total + converted * quantity
  }, 0)
}

export type WeightBreakdown = {
  worn: number
  consumable: number
  base: number
  total: number
}

/**
 * Calculates a full weight breakdown (worn, consumable, base, total)
 * for a set of pack items.
 */
export function calculateWeightBreakdown(
  items: PackItem[],
  toUnit: Unit
): WeightBreakdown {
  const { worn, consumable, total } = items.reduce(
    (acc, { item, quantity, worn }) => {
      const converted = convertWeightValue(item.weight || 0, item.unit, toUnit)
      const quantityWeight = converted * quantity
      return {
        worn: worn ? acc.worn + converted : acc.worn,
        consumable: item.consumable
          ? acc.consumable + quantityWeight
          : acc.consumable,
        total: acc.total + quantityWeight,
      }
    },
    { worn: 0, consumable: 0, total: 0 }
  )

  return {
    worn,
    consumable,
    base: total - (worn + consumable),
    total,
  }
}

/**
 * Calculates total weight per category for a list of categorized pack items.
 */
export function calculateCategoryWeights(
  categories: CategoryPackItems[],
  toUnit: Unit
) {
  return categories.map(category => ({
    label: category.category?.category.name || 'Uncategorized',
    value: sumPackItemWeights(category.items, toUnit),
    unit: toUnit,
  }))
}
