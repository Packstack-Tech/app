import { ColumnDef } from "@tanstack/react-table"
import { Item } from "@/types/item"

import { Action, ConsumableCell, NotesCell } from "./cells"
import { Currency } from "@/lib/currencies"

export const columns = (currency: Currency): ColumnDef<Item>[] => [
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
    accessorFn: (item) => {
      if (!item.price) return null
      return `${currency.symbol}${item.price.toFixed(currency.decimal_digits)}`
    },
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
    accessorFn: (item) => {
      if (!item.weight) return null
      const weight = item.unit === "g" ? item.weight : item.weight.toFixed(2)
      return `${weight} ${item.unit}`
    },
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
