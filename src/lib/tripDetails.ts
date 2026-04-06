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
  { value: 'easy', label: 'Easy (~2 mph)' },
  { value: 'moderate', label: 'Moderate (~3 mph)' },
  { value: 'fast', label: 'Fast (~4 mph)' },
]

export const TEMP_CATEGORY_OPTIONS = [
  { value: 'cold', label: 'Cold (< 32°F / 0°C)' },
  { value: 'moderate', label: 'Moderate (32–85°F / 0–29°C)' },
  { value: 'hot', label: 'Hot (> 85°F / 29°C)' },
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
