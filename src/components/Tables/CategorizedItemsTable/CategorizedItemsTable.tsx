import { CSSProperties, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  OnChangeFn,
  SortingState,
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
import { WeightValue } from '@/components/WeightValue'
import { useWeightSystem } from '@/hooks/useDisplayPrefs'
import { ownedValue } from '@/lib/overpack'
import { useUpdateItemSort } from '@/queries/item'

import { ItemRow } from './ItemRow'

type ColumnMeta = { style?: CSSProperties; align?: 'left' | 'right' | 'center' }

type SummaryRow = { weight?: number | null; unit?: string; price?: number | null; quantity?: number }

function computeGroupSummary(
  data: SummaryRow[]
): { count: number; totalGrams: number; value: number } {
  const CONVERSION: Record<string, number> = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 }
  let totalGrams = 0
  let totalValue = 0

  for (const item of data) {
    if (item.weight && item.unit) {
      totalGrams += item.weight * (CONVERSION[item.unit] || 1)
    }
    // Value counts every copy owned; weight counts one (you don't carry them all).
    if (item.price) totalValue += ownedValue(item)
  }

  return {
    count: data.length,
    totalGrams,
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
  /**
   * Sort state is owned by the parent so one header click applies to every
   * category section. Empty = the user's manual (drag) order. While a sort
   * is active, drag reordering is disabled because the manual order is
   * hidden anyway.
   */
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
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
  sorting,
  onSortingChange,
}: DataTableProps<TData, TValue>) {
  const weightSystem = useWeightSystem()
  const updateItemSort = useUpdateItemSort()
  const [categoryItems, setCategoryItems] = useState(data)

  useEffect(() => {
    setCategoryItems(data)
  }, [data])

  const isSorted = !!sorting && sorting.length > 0

  const table = useReactTable({
    data: categoryItems,
    columns,
    state: {
      globalFilter: searchFilter,
      sorting: sorting ?? [],
    },
    filterFns: { fuzzy: fuzzyFilter },
    onGlobalFilterChange: onSearchFilterChange,
    onSortingChange,
    enableSortingRemoval: true,   // asc → desc → off
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
    () => computeGroupSummary(data as SummaryRow[]),
    [data]
  )

  if (!visibleRows.length) return null

  const colGroup = (
    <colgroup>
      <col className="w-10" />
      {columns.map((column, i) => (
        <col key={i} style={(column.meta as ColumnMeta | undefined)?.style} />
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
                {headerGroup.headers.map(header => {
                  const canSort = header.column.getCanSort()
                  const dir = header.column.getIsSorted()
                  const align = (header.column.columnDef.meta as ColumnMeta | undefined)?.align
                  const label = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())
                  return (
                    <TableHead
                      key={header.id}
                      className={align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : undefined}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={
                            'inline-flex items-center gap-1 select-none hover:text-foreground transition-colors ' +
                            (dir ? 'text-foreground' : '') +
                            (align === 'right' ? ' flex-row-reverse' : '')
                          }
                          aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'}
                          title={
                            dir === 'asc' ? 'Sorted ascending — click for descending'
                              : dir === 'desc' ? 'Sorted descending — click to clear'
                                : 'Click to sort'
                          }
                        >
                          {label}
                          {dir === 'asc' ? (
                            <ArrowUp size={12} />
                          ) : dir === 'desc' ? (
                            <ArrowDown size={12} />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30" />
                          )}
                        </button>
                      ) : (
                        label
                      )}
                    </TableHead>
                  )
                })}
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
                  {groupSummary.count} {groupSummary.count === 1 ? 'item' : 'items'} ·{' '}
                  <WeightValue
                    value={groupSummary.totalGrams}
                    unit="g"
                    system={weightSystem}
                    format="total"
                  />
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
              disabled={!!searchFilter || isSorted}
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
