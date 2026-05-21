import { format } from 'date-fns'

import { dateToUtc } from '@/lib/utils'

export const TERRAIN_OPTIONS = [
  { value: 'paved', label: 'Paved' },
  { value: 'gravel', label: 'Gravel / Dirt' },
  { value: 'rugged', label: 'Rugged / Rocky' },
  { value: 'sand', label: 'Sand' },
  { value: 'swamp', label: 'Swamp / Marsh' },
]

export const PACE_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'fast', label: 'Fast' },
]

export const TEMP_CATEGORY_OPTIONS = [
  { value: 'cold', label: 'Cold' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'hot', label: 'Hot' },
]

export function formatDateRange(start?: string, end?: string) {
  if (!start) return null
  const from = format(dateToUtc(new Date(start)), 'LLL dd, y')
  if (!end) return from
  const to = format(dateToUtc(new Date(end)), 'LLL dd, y')
  return `${from} – ${to}`
}

export function labelFor(
  value: string | undefined,
  options: { value: string; label: string }[]
) {
  if (!value) return null
  return options.find(o => o.value === value)?.label ?? value
}
