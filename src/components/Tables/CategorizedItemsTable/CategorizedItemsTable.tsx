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
  TableCell,
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
  /**
   * Column headers render once, above the first section. Every section still
   * gets a <colgroup>, so the columns line up even though only one table in
   * the list carries a <thead>.
   */
  showHeader?: boolean
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
  showHeader = false,
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

  const colGroup = (
    <colgroup>
      <col className="w-10" />
      {columns.map((column, i) => (
        <col key={i} style={(column.meta as any)?.style} />
      ))}
    </colgroup>
  )

  return (
    <div id={`category-${category}`}>
      {showHeader && (
        <Table className="border-separate border-spacing-0">
          {colGroup}
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                <TableHead className="w-10 px-2" />
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        </Table>
      )}

      <Table>
        {colGroup}
        <TableBody>
          {/* The section bar is a row of this table rather than a div above
              it. As a div it had its own padding and drifted out of the column
              grid — its checkbox sat ~30px left of the checkboxes in the rows
              it selects. Inside the grid it lines up by construction, and the
              spacer mirrors the drag handle so the checkbox lands in the same
              column as the ones below it. */}
          <TableRow className="bg-muted! hover:bg-muted!">
            <TableCell className="w-10 px-2">
              <div className="flex items-center gap-1">
                <div className="shrink-0 w-4" />
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onClick={() => onToggleCategory?.(visibleIds)}
                  aria-label={`Select all in ${category}`}
                  className="opacity-40 hover:opacity-100 transition-opacity"
                />
              </div>
            </TableCell>
            <TableCell colSpan={columns.length}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-foreground text-sm">{category}</h3>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {groupSummary.count} {groupSummary.count === 1 ? 'item' : 'items'} · {groupSummary.weightDisplay}
                  {groupSummary.value > 0 && ` · $${groupSummary.value.toFixed(0)}`}
                </span>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>

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
