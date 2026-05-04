import { useCallback, useMemo, useState } from 'react'
import { AlertTriangle, Archive, ArchiveRestore, MoreHorizontal, Weight } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Button, Input } from '@/components/ui'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { ScrollArea, ScrollBar } from '@/components/ui/ScrollArea'
import { cn } from '@/lib/utils'
import { CategoryManagementModal } from '@/containers/CategoryManagementModal'
import { ImportCsvModal } from '@/containers/ImportCsvModal'
import { ImportLighterpackModal } from '@/containers/ImportLighterpackModal'
import { InventoryTable } from '@/containers/Inventory/InventoryTable'
import { useReplacementScores } from '@/hooks/useReplacementScores'
import { useSubscription } from '@/hooks/useSubscription'
import { useUser } from '@/hooks/useUser'
import { downloadInventory } from '@/lib/download'
import { formatCurrency } from '@/lib/currencies'
import { useGroupedInventory } from '@/queries/item'
import { useBulkArchiveItems, useBulkRestoreItems, useInventory } from '@/queries/item'
import { ItemCondition, ItemStatus } from '@/types/item'

const CONVERSION: Record<string, number> = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 }

export const InventoryPage = () => {
  const { data: inventory, isLoading } = useInventory()
  const user = useUser()
  const [openReorder, setOpenReorder] = useState(false)
  const [openLighterpackImport, setOpenLighterpackImport] = useState(false)
  const [openCsvmport, setOpenCsvImport] = useState(false)
  const [filter, setFilter] = useState('')
  const [showRemoved, setShowRemoved] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [statusFilter, setStatusFilter] = useState<ItemStatus | null>(null)
  const [conditionFilter, setConditionFilter] = useState<ItemCondition | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const { isSubscribed } = useSubscription()
  const allScores = useReplacementScores(inventory)
  const scores = isSubscribed ? allScores : new Map<number, number>()
  const { data: groups } = useGroupedInventory()

  const categoryNames = useMemo(() => {
    if (!groups) return []
    return groups
      .map(g => g.category?.category?.name || 'Uncategorized')
      .filter((name, i, arr) => arr.indexOf(name) === i)
  }, [groups])


  const bulkArchive = useBulkArchiveItems()
  const bulkRestore = useBulkRestoreItems()

  const toggleItem = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleCategory = useCallback((ids: number[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      const allSelected = ids.every(id => next.has(id))
      if (allSelected) {
        ids.forEach(id => next.delete(id))
      } else {
        ids.forEach(id => next.add(id))
      }
      return next
    })
  }, [])

  const deselectAll = useCallback(() => setSelectedIds(new Set()), [])

  const allVisibleIds = useMemo(() => {
    if (!inventory) return []
    return inventory
      .filter(item => showRemoved || !item.removed)
      .map(item => item.id)
  }, [inventory, showRemoved])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(allVisibleIds))
  }, [allVisibleIds])

  const handleBulkArchive = () => {
    const ids = Array.from(selectedIds)
    bulkArchive.mutate(ids, { onSuccess: () => setSelectedIds(new Set()) })
  }

  const handleBulkRestore = () => {
    const ids = Array.from(selectedIds)
    bulkRestore.mutate(ids, { onSuccess: () => setSelectedIds(new Set()) })
  }

  const stats = useMemo(() => {
    if (!inventory) return { count: 0, value: 0, weightDisplay: '0 g', attentionCount: 0 }
    const active = inventory.filter(i => !i.removed)
    const value = active.reduce((sum, i) => sum + (i.price || 0), 0)
    let totalGrams = 0
    for (const item of active) {
      if (item.weight && item.unit) {
        totalGrams += item.weight * (CONVERSION[item.unit] || 1)
      }
    }
    const weightDisplay = totalGrams >= 1000
      ? `${(totalGrams / 1000).toFixed(1)} kg`
      : `${Math.round(totalGrams)} g`

    let attentionCount = 0
    for (const item of active) {
      if (item.status === 'retired') continue
      const score = scores.get(item.id)
      if (score != null && score >= 0.7) attentionCount++
    }

    return { count: active.length, value, weightDisplay, attentionCount }
  }, [inventory, scores])

  const selectionCount = selectedIds.size
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedIds.has(id))
  const someSelected = selectionCount > 0 && !allSelected

  const { hasActive, hasRemoved } = useMemo(() => {
    if (!inventory || selectionCount === 0) return { hasActive: false, hasRemoved: false }
    let hasActive = false
    let hasRemoved = false
    for (const item of inventory) {
      if (!selectedIds.has(item.id)) continue
      if (item.removed) hasRemoved = true
      else hasActive = true
      if (hasActive && hasRemoved) break
    }
    return { hasActive, hasRemoved }
  }, [inventory, selectedIds, selectionCount])

  const isMixedSelection = hasActive && hasRemoved

  return (
    <div className="px-4 md:px-6 py-4">
      <div className="sticky top-0 z-10 bg-background pb-2 -mx-4 px-4 md:-mx-6 md:px-6 -mt-4 pt-4 border-b border-border/50">
        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="page-heading">Gear Closet</h1>
          <div className="flex justify-end items-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenReorder(true)}
            >
              Manage Categories
            </Button>

            <Button size="sm" asChild>
              <Link to="/inventory/new">Add Gear</Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setOpenLighterpackImport(true)}>
                  Import from LighterPack
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenCsvImport(true)}>
                  Import CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadInventory(
                  showRemoved ? inventory : inventory?.filter(i => !i.removed)
                )}>
                  Export Inventory
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stat strip */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span>
            <span className="font-semibold text-foreground tabular-nums">{stats.count}</span> items
          </span>
          {stats.value > 0 && (
            <span>
              <span className="font-semibold text-foreground tabular-nums">
                {formatCurrency(stats.value, user.currency)}
              </span> total value
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Weight size={12} />
            <span className="font-semibold text-foreground tabular-nums">{stats.weightDisplay}</span>
          </span>
          {stats.attentionCount > 0 && (
            <span className="inline-flex items-center gap-1 text-orange-400">
              <AlertTriangle size={12} />
              <span className="font-semibold tabular-nums">{stats.attentionCount}</span> need attention
            </span>
          )}
        </div>

        {/* Toolbar row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Input
            placeholder="Search..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="md:w-56 w-full"
          />

          <Select
            value={statusFilter || 'all'}
            onValueChange={v => setStatusFilter(v === 'all' ? null : v as ItemStatus)}
          >
            <SelectTrigger className="w-[120px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="wishlist">Wishlist</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={conditionFilter || 'all'}
            onValueChange={v => setConditionFilter(v === 'all' ? null : v as ItemCondition)}
          >
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All conditions</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="worn">Worn</SelectItem>
            </SelectContent>
          </Select>

          <label className="flex items-center gap-1.5 cursor-pointer select-none ml-auto">
            <Checkbox
              checked={showRemoved}
              onClick={() => setShowRemoved(!showRemoved)}
            />
            <span className="text-xs text-muted-foreground leading-none text-nowrap">
              Show removed
            </span>
          </label>
        </div>

        {/* Category pill tabs */}
        {categoryNames.length > 1 && (
          <ScrollArea className="-mx-4 md:-mx-6 pb-2">
            <div className="flex items-center gap-1.5 px-4 md:px-6">
              <button
                type="button"
                onClick={() => setCategoryFilter(null)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  categoryFilter === null
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                All
              </button>
              {categoryNames.map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setCategoryFilter(categoryFilter === name ? null : name)}
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap',
                    categoryFilter === name
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}

        {/* Bulk selection toolbar */}
        <div className="flex items-center gap-2 min-h-8">
          <div className="flex items-center gap-2">
            {allVisibleIds.length > 0 && (
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onClick={() => allSelected ? deselectAll() : selectAll()}
              />
            )}
            <span className="text-xs font-medium text-foreground">
              {selectionCount} selected
            </span>
            {selectionCount > 0 && (
              <>
                {hasActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkArchive}
                    disabled={bulkArchive.isPending || isMixedSelection}
                    className="h-7 text-xs gap-1"
                  >
                    <Archive size={14} />
                    Archive
                  </Button>
                )}
                {hasRemoved && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkRestore}
                    disabled={bulkRestore.isPending || isMixedSelection}
                    className="h-7 text-xs gap-1"
                  >
                    <ArchiveRestore size={14} />
                    Restore
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <ImportLighterpackModal
          open={openLighterpackImport}
          onOpenChange={setOpenLighterpackImport}
        />
        <ImportCsvModal open={openCsvmport} onOpenChange={setOpenCsvImport} />
        <CategoryManagementModal
          open={openReorder}
          onOpenChange={setOpenReorder}
        />
        <InventoryTable
          searchFilter={filter}
          isLoading={isLoading}
          showRemoved={showRemoved}
          selectedIds={selectedIds}
          onToggleItem={toggleItem}
          onToggleCategory={toggleCategory}
          scores={scores}
          statusFilter={statusFilter}
          conditionFilter={conditionFilter}
          categoryFilter={categoryFilter}
        />
      </div>
    </div>
  )
}
