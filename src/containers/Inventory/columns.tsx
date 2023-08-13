import { ColumnDef } from "@tanstack/react-table"
import { Item } from "@/types/item"

import { Action, ConsumableCell, NotesCell } from "./cells"

export const columns: ColumnDef<Item>[] = [
  {
    header: "Name",
    accessorKey: "name",
    meta: {
      style: {
        width: "20%",
      },
    },
  },
  {
    header: "Manufacturer",
    accessorKey: "brand.name",
    meta: {
      style: {
        width: "15%",
      },
    },
  },
  {
    header: "Product",
    accessorKey: "product.name",
    meta: {
      style: {
        width: "15%",
      },
    },
  },
  {
    header: "Value",
    accessorFn: ({ price }) => (price ? price?.toFixed(2) : null),
    meta: {
      style: {
        width: "10%",
      },
    },
  },
  {
    header: "Notes",
    accessorKey: "notes",
    cell: ({ cell }) => <NotesCell cell={cell} />,
    meta: {
      align: "center",
      style: {
        textAlign: "center",
        width: "10%",
      },
    },
  },
  {
    header: "Consumable",
    accessorKey: "consumable",
    cell: ({ cell }) => <ConsumableCell cell={cell} />,
    meta: {
      align: "center",
      style: {
        textAlign: "center",
        width: "10%",
      },
    },
  },
  {
    header: "Weight",
    accessorFn: (item) =>
      item.weight ? `${item.weight?.toFixed(2)} ${item.unit}` : null,
    meta: {
      align: "right",
      style: { textAlign: "right", width: "10%" },
    },
  },
  {
    id: "actions",
    cell: ({ cell }) => <Action cell={cell} />,
    meta: {
      align: "right",
      style: {
        width: "80px",
      },
    },
  },
]
