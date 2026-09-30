import { PackItem, PackItemEditableKeys } from '@/types/pack'

/**
 * Worn units of a pack item. Same rule as the API
 * (api/app/utils/pack_weight.py `effective_worn`), the mobile app and the
 * public site — keep them in step.
 *
 * Tolerates data from before `worn_quantity` existed (cached trips, rows the
 * old API wrote before the backfill): `worn` with no count reads as one unit.
 */
export const wornQuantity = (pi: {
  quantity: number
  worn: boolean
  worn_quantity?: number | null
}): number => {
  const q = pi.quantity || 0
  const wq = Number(pi.worn_quantity ?? 0)
  if (wq > 0) return Math.min(wq, q)
  if (pi.worn) return Math.min(1, q)
  return 0
}

const clamp = (v: number, max: number) => Math.max(0, Math.min(v, max))

/**
 * Apply one edit to a pack item, keeping 0 <= worn_quantity <= quantity and
 * `worn === worn_quantity > 0`. Used by the trip store's updateItem so every
 * caller (quantity cell, worn toggle, stepper) gets the invariant for free.
 */
export const applyPackItemEdit = (
  pi: PackItem,
  key: PackItemEditableKeys,
  value: number | boolean
): PackItem => {
  const current = wornQuantity(pi)
  switch (key) {
    case 'quantity': {
      const quantity = value as number
      const worn_quantity = clamp(current, quantity)
      return { ...pi, quantity, worn_quantity, worn: worn_quantity > 0 }
    }
    case 'worn_quantity': {
      const worn_quantity = clamp(value as number, pi.quantity)
      return { ...pi, worn_quantity, worn: worn_quantity > 0 }
    }
    case 'worn': {
      const worn_quantity = value ? Math.max(current, Math.min(1, pi.quantity)) : 0
      return { ...pi, worn_quantity, worn: worn_quantity > 0 }
    }
    default:
      return { ...pi, [key]: value }
  }
}

/**
 * Pack items as sent to the API: always with an explicit, effective
 * worn_quantity, so a legacy row (worn, no count) is saved as what it shows.
 */
export const withWornQuantity = (items: PackItem[]): PackItem[] =>
  items.map(pi => {
    const worn_quantity = wornQuantity(pi)
    return { ...pi, worn_quantity, worn: worn_quantity > 0 }
  })
