import { ColumnDef } from "@tanstack/react-table"
import { PackItem } from "@/types/pack"
import {
  QuantityCell,
  NotesCell,
  WornCell,
  RemoveItemCell,
  WeightCell,
} from "./cells"
import { Currency } from "@/lib/currencies"

export const columns = (currency: Currency): ColumnDef<PackItem>[] => [
  {
    header: "Quantity",
    cell: ({ cell }) => <QuantityCell cell={cell} />,
    meta: {
      style: { width: "10%" },
    },
  },
  {
    header: "Name",
    accessorKey: "item.name",
    meta: {
      style: {
        width: "20%",
      },
    },
  },
  {
    header: "Product",
    accessorFn: ({ item }) =>
      `${item.brand?.name || ""} ${item.product?.name || ""}`,
    meta: {
      style: {
        width: "20%",
      },
    },
  },
  {
    header: "Value",
    accessorFn: ({ item }) => {
      if (!item.price) return null
      return `${currency.symbol}${item.price.toFixed(currency.decimal_digits)}`
    },
    meta: {
      style: {
        width: "15%",
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
        width: "15%",
      },
    },
  },
  {
    header: "Worn",
    cell: ({ cell }) => <WornCell cell={cell} />,
    meta: {
      align: "center",
      style: { textAlign: "center", width: "5%" },
    },
  },
  {
    header: "Weight",
    cell: ({ cell }) => <WeightCell cell={cell} />,
    meta: {
      align: "right",
      style: { textAlign: "right", width: "10%" },
    },
  },
  {
    id: "remove",
    cell: ({ cell }) => <RemoveItemCell cell={cell} />,
    meta: {
      align: "center",
      style: { textAlign: "center", width: "5%" },
    },
  },
]
