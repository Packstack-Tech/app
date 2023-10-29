import { Item } from "@/types/item"
import { saveAs } from "file-saver"

// download a csv containing the inventory data
export const downloadInventory = (items?: Item[]) => {
  if (!items) return

  const header = [
    "name",
    "manufacturer",
    "product",
    "category",
    "weight",
    "unit",
    "price",
    "consumable",
    "product_url",
    "notes",
  ].join(",")
  const csv = items
    .map(
      ({
        name,
        brand,
        product,
        category,
        weight,
        unit,
        consumable,
        price,
        product_url,
        notes,
      }) =>
        `${name},${brand?.name || ""},${product?.name || ""},${
          category?.category.name || ""
        },${weight},${unit},${price},${
          consumable ? "consumable" : ""
        },${product_url},${notes}`
    )
    .join("\n")

  const content = header + "\n" + csv

  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  saveAs(blob, "inventory.csv")
}
