import { useEffect, useMemo, useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { fuzzyFilter } from '@/components/Tables/lib/fuzzyFilter'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { useUser } from '@/hooks/useUser'
import { SYSTEM_UNIT } from '@/lib/consts'
import { formatTotalWeight } from '@/lib/weight'
import { useUpdateItemSort } from '@/queries/item'

import { ItemRow } from './ItemRow'

function computeGroupSummary(
  data: any[],
  unitSystem: SYSTEM_UNIT
): { count: number; weightDisplay: string; value: number } {
  const CONVERSION: Record<string, number> = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 }
  let totalGrams = 0
  let totalValue = 0

  for (const item of data) {
    if (item.weight && item.unit) {
      totalGrams += item.weight * (CONVERSION[item.unit] || 1)
    }
    if (item.price) totalValue += item.price
  }

  return {
    count: data.length,
    weightDisplay: formatTotalWeight(totalGrams, unitSystem),
    value: totalValue,
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchFilter?: string
  onSearchFilterChange?: (value: string) => void
  category: string
  selectedIds?: Set<number>
  activeItemId?: number | null
  onToggleItem?: (id: number) => void
  onToggleCategory?: (ids: number[]) => void
  onSelectItem?: (id: number) => void
}

export function CategorizedItemsTable<TData extends { id: number }, TValue>({
  columns,
  data,
  searchFilter,
  onSearchFilterChange,
  category,
  selectedIds,
  activeItemId,
  onToggleItem,
  onToggleCategory,
  onSelectItem,
}: DataTableProps<TData, TValue>) {
  const user = useUser()
  const updateItemSort = useUpdateItemSort()
  const [categoryItems, setCategoryItems] = useState(data)

  useEffect(() => {
    setCategoryItems(data)
  }, [data])

  const table = useReactTable({
    data: categoryItems,
    columns,
    state: {
      globalFilter: searchFilter,
      sorting: [{ id: 'sort_order', desc: false }],
    },
    filterFns: { fuzzy: fuzzyFilter },
    onGlobalFilterChange: onSearchFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const moveItem = (dragIndex: number | undefined, hoverIndex: number) => {
    if (dragIndex === undefined) return
    setCategoryItems(prev => {
      const newItems = [...prev]
      const dragItem = newItems[dragIndex]
      newItems.splice(dragIndex, 1)
      newItems.splice(hoverIndex, 0, dragItem)
      return newItems
    })
  }

  const onDropItem = () => {
    const sortOrder = categoryItems.map((item, idx) => ({
      id: item.id,
      sort_order: idx,
    }))
    updateItemSort.mutate(sortOrder)
  }

  const visibleRows = table.getRowModel().rows
  const visibleIds = useMemo(
    () => visibleRows.map(row => (row.original as TData).id),
    [visibleRows]
  )
  const selectedCount = useMemo(
    () => (selectedIds ? visibleIds.filter(id => selectedIds.has(id)).length : 0),
    [selectedIds, visibleIds]
  )
  const allSelected = selectedCount > 0 && selectedCount === visibleIds.length
  const someSelected = selectedCount > 0 && !allSelected

  const groupSummary = useMemo(
    () => computeGroupSummary(data, user.unit_weight),
    [data, user.unit_weight]
  )

  if (!visibleRows.length) return null

  return (
    <div id={`category-${category}`}>
      <div className="flex items-center justify-between px-3 py-2 bg-muted">
        <h3 className="font-semibold text-primary tracking-wide text-sm md:text-base">
          {category}
        </h3>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {groupSummary.count} {groupSummary.count === 1 ? 'item' : 'items'} · {groupSummary.weightDisplay}
          {groupSummary.value > 0 && ` · $${groupSummary.value.toFixed(0)}`}
        </span>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              <TableHead className="w-10 px-2">
                <div className="flex items-center gap-1">
                  <div className="shrink-0 w-4" />
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onClick={() => onToggleCategory?.(visibleIds)}
                    className="opacity-40 hover:opacity-100 transition-opacity"
                  />
                </div>
              </TableHead>
              {headerGroup.headers.map(header => {
                return (
                  <TableHead
                    key={header.id}
                    style={(header.column.columnDef.meta as any)?.style}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {visibleRows.map((row, idx) => (
            <ItemRow
              row={row}
              moveItem={moveItem}
              onDropItem={onDropItem}
              key={row.id}
              idx={idx}
              id={category}
              disabled={!!searchFilter}
              isSelected={selectedIds?.has((row.original as TData).id)}
              isActive={activeItemId === (row.original as TData).id}
              onToggleSelect={() => onToggleItem?.((row.original as TData).id)}
              onRowClick={onSelectItem ? () => onSelectItem((row.original as TData).id) : undefined}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
