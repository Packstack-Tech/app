import { FC, useState } from 'react'

import { Button } from '@/components/ui'
import { useReplacementScore } from '@/queries/itemLifecycle'
import { BenchmarkSheet } from '@/containers/ItemDetail/BenchmarkSheet'

interface Props {
  itemId: number
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 0.7) return { label: 'Replace soon', color: 'text-red-400' }
  if (score >= 0.4) return { label: 'Moderate wear', color: 'text-yellow-400' }
  return { label: 'Good condition', color: 'text-emerald-400' }
}

function getBarColor(score: number): string {
  if (score >= 0.7) return 'bg-red-500'
  if (score >= 0.4) return 'bg-yellow-500'
  return 'bg-emerald-500'
}

export const ReplacementSection: FC<Props> = ({ itemId }) => {
  const { data } = useReplacementScore(itemId)
  const [sheetOpen, setSheetOpen] = useState(false)

  if (!data || data.score == null) {
    return (
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4">Replacement Score</h2>
        <p className="text-sm text-muted-foreground">
          Not enough data to calculate a replacement score. Add an acquired date and condition to get started.
        </p>
      </section>
    )
  }

  const pct = Math.round(data.score * 100)
  const { label, color } = getScoreLabel(data.score)
  const barColor = getBarColor(data.score)

  const lifespanYears = data.benchmark?.lifespan_years
  const summary = lifespanYears
    ? `Based on a ${lifespanYears}-year ${data.category.toLowerCase()} lifespan, this item is approximately ${pct}% through its expected life.`
    : `This item has a replacement score of ${pct}%.`

  const conditionNote = data.condition
    ? ` Condition reported as "${data.condition}".`
    : ''

  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-4">Replacement Score</h2>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <span className={`text-sm font-semibold tabular-nums ${color}`}>{pct}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${color}`}>{label}</span>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> Good</span>
            <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-yellow-500" /> Moderate</span>
            <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-red-500" /> Replace</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {summary}{conditionNote}
        </p>

        {data.is_default_fallback && (
          <p className="text-xs text-yellow-400/90 bg-yellow-500/10 rounded-md px-3 py-2">
            No benchmark configured for &ldquo;{data.category}&rdquo;. Using default estimate ({lifespanYears ?? 5}-year lifespan).{' '}
            <button
              type="button"
              className="underline hover:text-yellow-300 transition-colors"
              onClick={() => setSheetOpen(true)}
            >
              Customize benchmarks
            </button>
          </p>
        )}

        <Button variant="link" size="sm" className="px-0 h-auto text-xs" onClick={() => setSheetOpen(true)}>
          Customize benchmarks
        </Button>
      </div>

      <BenchmarkSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </section>
  )
}
