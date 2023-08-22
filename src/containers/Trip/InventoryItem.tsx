import { FC } from "react"
import { Item } from "@/types/item"

interface Props {
  item: Item
  selected: boolean
  onClick: (item: Item) => void
}

export const InventoryItem: FC<Props> = ({ item, selected, onClick }) => (
  <li className="mb-1">
    <button
      onClick={() => onClick(item)}
      className={`p-1 w-full rounded-sm text-left border border-transparent hover:bg-slate-900 ${
        selected ? " border-slate-800" : ""
      }`}
    >
      <div className="text-slate-100 text-xs font-semibold">{item.name}</div>
      <div className="text-slate-200 text-xs">
        {item.brand?.name} {item.product?.name}
      </div>
      {!!item.weight && (
        <div className="text-slate-200 text-xs">
          {item.weight} {item.unit}
        </div>
      )}
    </button>
  </li>
)
