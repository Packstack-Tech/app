import { ColumnDef } from "@tanstack/react-table"
import { PackItem } from "@/types/pack"
import { QuantityCell } from "./cells"

export const columns: ColumnDef<PackItem>[] = [
  {
    header: "Quantity",
    cell: ({ cell }) => <QuantityCell cell={cell} />,
    meta: {
      style: { width: "96px" },
    },
  },
  {
    header: "Name",
    accessorKey: "item.name",
  },
  {
    header: "Product",
    accessorFn: ({ item }) =>
      `${item.brand?.name || ""} ${item.product?.name || ""}`,
  },
  {
    header: "Value",
    accessorFn: ({ item }) => (item.price ? item.price?.toFixed(2) : null),
  },
  {
    header: "Weight",
    accessorFn: ({ item }) =>
      item.weight ? `${item.weight?.toFixed(2)} ${item.unit}` : null,
    meta: {
      align: "right",
      style: { textAlign: "right" },
    },
  },
]
