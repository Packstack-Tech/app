import { FC, useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { useReplacementScores } from '@/hooks/useReplacementScores'
import { useInventory } from '@/queries/item'
import { Item } from '@/types/item'

const SCORE_THRESHOLD = 0.7
const MAX_ITEMS = 5

type ScoredItem = {
  item: Item
  score: number
}

function ScoreBadge({ score }: { score: number }) {
  const label = score >= 0.85 ? 'Replace' : 'Moderate'
  const color =
    score >= 0.85
      ? 'bg-red-500/15 text-red-600'
      : 'bg-amber-500/15 text-amber-600'
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

function ConditionBadge({ condition }: { condition: string }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
      {condition}
    </span>
  )
}

export const NeedsAttention: FC = () => {
  const { data: inventory, isLoading } = useInventory()
  const scores = useReplacementScores(inventory)

  const attentionItems: ScoredItem[] = useMemo(() => {
    if (!inventory) return []
    const items: ScoredItem[] = []
    for (const item of inventory) {
      if (item.removed) continue
      if (item.status === 'retired') continue
      const score = scores.get(item.id)
      if (score != null && score >= SCORE_THRESHOLD) {
        items.push({ item, score })
      }
    }
    items.sort((a, b) => b.score - a.score)
    return items.slice(0, MAX_ITEMS)
  }, [inventory, scores])

  if (isLoading || attentionItems.length === 0) return null

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={14} className="text-amber-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Needs Attention
        </h3>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {attentionItems.length} item{attentionItems.length !== 1 && 's'}
        </span>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {attentionItems.map(({ item, score }) => (
          <Link
            key={item.id}
            to="/inventory/$itemId"
            params={{ itemId: `${item.id}` }}
            className="flex items-center justify-between gap-3 py-2 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium truncate">
                {item.name}
              </span>
              {item.condition && <ConditionBadge condition={item.condition} />}
            </div>
            <ScoreBadge score={score} />
          </Link>
        ))}
      </div>

      {scores.size > 0 && (
        <div className="mt-2 pt-2 border-t border-border">
          <Link
            to="/inventory"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all in Gear Closet &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}
