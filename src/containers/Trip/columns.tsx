import { ColumnDef } from "@tanstack/react-table"
import { PackItem } from "@/types/pack"
import { QuantityCell, ConsumableCell, WornCell } from "./cells"

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
    accessorFn: ({ item }) => (item.price ? item.price?.toFixed(2) : null),
    meta: {
      style: {
        width: "10%",
      },
    },
  },
  {
    header: "Consumable",
    cell: ({ cell }) => <ConsumableCell cell={cell} />,
    meta: {
      align: "center",
      style: { textAlign: "center", width: "10%" },
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
    accessorFn: ({ item }) =>
      item.weight ? `${item.weight?.toFixed(2)} ${item.unit}` : null,
    meta: {
      align: "right",
      style: { textAlign: "right", width: "15%" },
    },
  },
]
