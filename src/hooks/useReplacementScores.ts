import { useMemo } from 'react'

import { useBenchmarks } from '@/queries/benchmark'
import { AllBenchmarks, Item } from '@/types/item'

const CONDITION_SCORES: Record<string, number> = {
  new: 0.0,
  good: 0.25,
  fair: 0.5,
  worn: 0.8,
}

const FALLBACK_BENCHMARK = { lifespan_years: 5, expected_nights: 300 }

function computeScore(
  item: Item,
  benchmarks: AllBenchmarks | undefined,
  categoryName: string
): number | null {
  const benchmark = benchmarks?.[categoryName] ?? FALLBACK_BENCHMARK
  const factors: number[] = []

  if (item.acquired_date) {
    const ageMs = Date.now() - new Date(item.acquired_date).getTime()
    const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000)
    const lifespan = benchmark.lifespan_years
    if (lifespan && lifespan > 0) {
      factors.push(Math.min(ageYears / lifespan, 1.0))
    }
  }

  if (item.condition) {
    const s = CONDITION_SCORES[item.condition]
    if (s !== undefined) factors.push(s)
  }

  if (factors.length === 0) return null
  return Math.round(Math.max(...factors) * 1000) / 1000
}

function getCategoryName(item: Item): string {
  return item.category?.category?.name ?? 'Miscellaneous'
}

export type ItemScores = Map<number, number | null>

export const useReplacementScores = (items: Item[] | undefined): ItemScores => {
  const { data: benchmarks } = useBenchmarks()

  return useMemo(() => {
    const scores = new Map<number, number | null>()
    if (!items) return scores
    for (const item of items) {
      if (item.removed) continue
      scores.set(item.id, computeScore(item, benchmarks, getCategoryName(item)))
    }
    return scores
  }, [items, benchmarks])
}
