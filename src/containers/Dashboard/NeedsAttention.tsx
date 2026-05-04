import { FC, useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { useReplacementScores } from '@/hooks/useReplacementScores'
import { useSubscription } from '@/hooks/useSubscription'
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
  const { isSubscribed } = useSubscription()
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

  if (!isSubscribed || isLoading || attentionItems.length === 0) return null

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-amber-500" />
        <h3 className="text-sm font-semibold">Gear Needing Attention</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {attentionItems.length} item{attentionItems.length !== 1 && 's'}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {attentionItems.map(({ item, score }) => (
          <Link
            key={item.id}
            to="/inventory/$itemId"
            params={{ itemId: `${item.id}` }}
            className="flex items-center justify-between gap-3 rounded-md px-3 py-2 -mx-1 hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium truncate">
                {item.name}
              </span>
              {item.category?.category?.name && (
                <span className="hidden sm:inline text-xs text-muted-foreground">
                  {item.category.category.name}
                </span>
              )}
              {item.condition && <ConditionBadge condition={item.condition} />}
            </div>
            <ScoreBadge score={score} />
          </Link>
        ))}
      </div>

      {scores.size > 0 && (
        <div className="mt-3 pt-3 border-t">
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
