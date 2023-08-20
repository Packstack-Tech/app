import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table"

import { fuzzyFilter } from "@/components/Tables/lib/fuzzyFilter"
import { ItemRow } from "./ItemRow"
import { useTripPacks } from "@/hooks/useTripPacks"
import { PackItem } from "@/types/pack"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  category: string
}

export function CategorizedPackItemsTable<TData, TValue>({
  columns,
  data,
  category,
}: DataTableProps<TData, TValue>) {
  const { setCategoryItems, hideHeaders } = useTripPacks((store) => ({
    setCategoryItems: store.setCategoryItems,
    hideHeaders: store.hideHeaders,
  }))

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: [{ id: "sort_order", desc: false }],
    },
    filterFns: { fuzzy: fuzzyFilter },
    getCoreRowModel: getCoreRowModel(),
  })

  const moveItem = (dragIndex: number | undefined, hoverIndex: number) => {
    if (dragIndex === undefined) return
    const newItems = [...data]
    const dragItem = newItems[dragIndex]
    newItems.splice(dragIndex, 1)
    newItems.splice(hoverIndex, 0, dragItem)
    setCategoryItems(newItems as PackItem[])
  }

  if (!table.getRowModel().rows?.length) return null

  return (
    <div className="mb-4">
      <h3 className="font-bold text-primary text-sm mb-2">{category}</h3>
      <div className="rounded-md border border-slate-900">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className={`w-6 ${hideHeaders ? "h-0 p-0" : ""}`} />
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={(header.column.columnDef.meta as any)?.style}
                      className={`${hideHeaders ? "h-0 p-0" : ""}`}
                    >
                      {header.isPlaceholder || hideHeaders
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
                key={row.id}
                idx={idx}
                id={category}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
