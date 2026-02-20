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
import { useUpdateItemSort } from '@/queries/item'

import { ItemRow } from './ItemRow'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchFilter?: string
  onSearchFilterChange?: (value: string) => void
  category: string
  selectedIds?: Set<number>
  onToggleItem?: (id: number) => void
  onToggleCategory?: (ids: number[]) => void
}

export function CategorizedItemsTable<TData extends { id: number }, TValue>({
  columns,
  data,
  searchFilter,
  onSearchFilterChange,
  category,
  selectedIds,
  onToggleItem,
  onToggleCategory,
}: DataTableProps<TData, TValue>) {
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

  if (!visibleRows.length) return null

  return (
    <div className="mb-6" id={`category-${category}`}>
      <h3 className="font-bold text-foreground rounded-t-md px-3 py-2 bg-muted dark:bg-slate-900 text-xs md:text-sm">
        {category}
      </h3>
      <div className="rounded-b-md border border-muted dark:border-slate-900">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                <TableHead className="w-10 px-2">
                  <div className="flex items-center justify-end">
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
                onToggleSelect={() => onToggleItem?.((row.original as TData).id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
