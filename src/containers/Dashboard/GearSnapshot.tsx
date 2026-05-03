import { FC, useMemo } from 'react'
import { PackageOpen, Weight } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { useUser } from '@/hooks/useUser'
import { formatCurrency } from '@/lib/currencies'
import { useInventory } from '@/queries/item'

const CONVERSION: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
}

export const GearSnapshot: FC = () => {
  const { data: inventory, isLoading } = useInventory()
  const user = useUser()

  const stats = useMemo(() => {
    if (!inventory) return null
    const active = inventory.filter(i => !i.removed)
    const count = active.length
    const wishlistCount = active.filter(i => i.status === 'wishlist').length
    const value = active.reduce((sum, i) => sum + (i.price || 0), 0)

    let totalGrams = 0
    for (const item of active) {
      if (item.weight && item.unit) {
        totalGrams += item.weight * (CONVERSION[item.unit] || 1)
      }
    }
    const weightDisplay =
      totalGrams >= 1000
        ? `${(totalGrams / 1000).toFixed(1)} kg`
        : `${Math.round(totalGrams)} g`

    return { count, value, weightDisplay, wishlistCount }
  }, [inventory])

  if (isLoading || !stats || stats.count === 0) return null

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <PackageOpen size={16} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold">Gear Snapshot</h3>
      </div>

      <Link
        to="/inventory"
        className="flex flex-wrap items-center gap-4 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-semibold tabular-nums">{stats.count}</span>
          <span className="text-muted-foreground">items</span>
        </div>

        {stats.value > 0 && (
          <div className="text-sm">
            <span className="font-semibold tabular-nums">
              {formatCurrency(stats.value, user.currency)}
            </span>
            <span className="text-muted-foreground ml-1">value</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-sm">
          <Weight size={13} className="text-muted-foreground" />
          <span className="font-semibold tabular-nums">
            {stats.weightDisplay}
          </span>
        </div>

        {stats.wishlistCount > 0 && (
          <div className="text-sm">
            <span className="font-semibold tabular-nums">
              {stats.wishlistCount}
            </span>
            <span className="text-muted-foreground ml-1">wishlist</span>
          </div>
        )}
      </Link>
    </div>
  )
}
