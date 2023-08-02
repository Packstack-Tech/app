import { FC } from "react"
import { Item } from "@/types/item"

interface Props {
  item: Item
  onClick: (item: Item) => void
}

export const InventoryItem: FC<Props> = ({ item, onClick }) => (
  <li>
    <button
      onClick={() => onClick(item)}
      className="p-2 rounded w-full text-left hover:bg-slate-900"
    >
      <div className="text-slate-100 text-sm font-semibold">{item.name}</div>
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
