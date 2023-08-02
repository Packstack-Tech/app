import commandScore from 'command-score'
import { Option } from '@/types/lib'
import { useMemo } from 'react'

type Result = {
  score: number
  item: Option
}

export const useFuzzySearch = (options: Option[], query: string) => {
  return useMemo(() => {
    if (!query) return options

    let results: Result[] = []

    options.forEach((item) => {
      const score = commandScore(item.label, query)
      if (score > 0) {
        results.push({ score: score, item: item })
      }
    })

    return results
      .sort((a, b) => {
        if (a.score === b.score) {
          return a.item.label.localeCompare(b.item.label)
        }
        return b.score - a.score
      })
      .map((suggestion) => suggestion.item)
  }, [options, query])
}
