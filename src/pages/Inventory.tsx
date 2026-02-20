import { useCallback, useMemo, useState } from 'react'
import { Archive, ArchiveRestore, MoreHorizontal, X } from 'lucide-react'

import { Button, Input } from '@/components/ui'
import { Checkbox } from '@/components/ui/Checkbox'
import { DialogTrigger } from '@/components/ui/Dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { CategoryManagementModal } from '@/containers/CategoryManagementModal'
import { ImportCsvModal } from '@/containers/ImportCsvModal'
import { ImportLighterpackModal } from '@/containers/ImportLighterpackModal'
import { InventoryTable } from '@/containers/Inventory/InventoryTable'
import { ItemForm } from '@/containers/ItemForm'
import { useUser } from '@/hooks/useUser'
import { downloadInventory } from '@/lib/download'
import { useBulkArchiveItems, useBulkRestoreItems, useInventory } from '@/queries/item'

export const InventoryPage = () => {
  const { data: inventory, isLoading } = useInventory()
  const user = useUser()
  const [open, setOpen] = useState(false)
  const [openReorder, setOpenReorder] = useState(false)
  const [openLighterpackImport, setOpenLighterpackImport] = useState(false)
  const [openCsvmport, setOpenCsvImport] = useState(false)
  const [filter, setFilter] = useState('')
  const [showRemoved, setShowRemoved] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

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

  const handleBulkArchive = () => {
    const ids = Array.from(selectedIds)
    bulkArchive.mutate(ids, { onSuccess: () => setSelectedIds(new Set()) })
  }

  const handleBulkRestore = () => {
    const ids = Array.from(selectedIds)
    bulkRestore.mutate(ids, { onSuccess: () => setSelectedIds(new Set()) })
  }

  const totalValue = useMemo(() => {
    if (!inventory) return 0
    return inventory
      .filter(item => !item.removed)
      .reduce((sum, item) => sum + (item.price || 0), 0)
  }, [inventory])

  const selectionCount = selectedIds.size

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
        <div className="flex items-center justify-between mb-2">
          <h1 className="page-heading">Inventory</h1>
          <div className="flex justify-end items-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenReorder(true)}
            >
              Manage Categories
            </Button>

            <ItemForm
              title="New Item"
              open={open}
              onOpenChange={setOpen}
              onClose={() => setOpen(false)}
            >
              <DialogTrigger asChild>
                <Button size="sm">Add Gear</Button>
              </DialogTrigger>
            </ItemForm>

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
                <DropdownMenuItem onClick={() => downloadInventory(inventory)}>
                  Export Inventory
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 mb-2">
          <Input
            placeholder="Search..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="md:w-64 w-full"
          />
          {totalValue > 0 && (
            <div className="text-sm text-muted-foreground">
              Total value{' '}
              <span className="font-semibold text-foreground">
                {user.currency.symbol}
                {totalValue.toFixed(user.currency.decimal_digits)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 min-h-8">
          <div className="flex items-center gap-2">
            {selectionCount > 0 && (
              <>
                <span className="text-xs font-medium text-foreground">
                  {selectionCount} selected
                </span>
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
                <button
                  onClick={deselectAll}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
                >
                  <X size={12} />
                  Deselect
                </button>
              </>
            )}
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <Checkbox
              checked={showRemoved}
              onClick={() => setShowRemoved(!showRemoved)}
            />
            <span className="text-xs text-muted-foreground leading-none text-nowrap">
              Show removed items
            </span>
          </label>
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
      />
      </div>
    </div>
  )
}
