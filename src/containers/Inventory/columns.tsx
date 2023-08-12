import { ColumnDef } from "@tanstack/react-table"
import { Item } from "@/types/item"

import { Action } from "./cells"

export const columns: ColumnDef<Item>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Manufacturer",
    accessorKey: "brand.name",
  },
  {
    header: "Product",
    accessorKey: "product.name",
  },
  {
    header: "Weight",
    accessorFn: (item) =>
      item.weight ? `${item.weight?.toFixed(2)} ${item.unit}` : null,
    meta: {
      align: "right",
      style: { textAlign: "right" },
    },
  },
  {
    header: "Value",
    accessorFn: ({ price }) => (price ? price?.toFixed(2) : null),
  },
  {
    id: "actions",
    cell: ({ cell }) => <Action cell={cell} />,
    meta: {
      align: "right",
    },
  },
]
