import { useEffect, useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { useUpdateItemSort } from "@/queries/item"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table"
import { fuzzyFilter } from "@/components/Tables/lib/fuzzyFilter"
import { ItemRow } from "./ItemRow"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchFilter?: string
  onSearchFilterChange?: (value: string) => void
  category: string
}

export function CategorizedItemsTable<TData extends { id: number }, TValue>({
  columns,
  data,
  searchFilter,
  onSearchFilterChange,
  category,
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
      sorting: [{ id: "sort_order", desc: false }],
    },
    filterFns: { fuzzy: fuzzyFilter },
    onGlobalFilterChange: onSearchFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const moveItem = (dragIndex: number | undefined, hoverIndex: number) => {
    if (dragIndex === undefined) return
    setCategoryItems((prev) => {
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

  if (!table.getRowModel().rows?.length) return null

  return (
    <div className="mb-8">
      <h3 className="font-bold text-primary mb-2">{category}</h3>
      <div className="rounded-md border border-slate-900">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className="w-6" />
                {headerGroup.headers.map((header) => {
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
            {table.getRowModel().rows.map((row, idx) => (
              <ItemRow
                row={row}
                moveItem={moveItem}
                onDropItem={onDropItem}
                key={row.id}
                idx={idx}
                id={category}
                disabled={!!searchFilter}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
