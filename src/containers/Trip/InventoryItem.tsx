import { FC } from 'react'
import { CircleIcon, Plus } from 'lucide-react'

import { Item } from '@/types/item'

interface Props {
  item: Item
  selected: boolean
  onClick: (item: Item) => void
}

export const InventoryItem: FC<Props> = ({ item, selected, onClick }) => {
  const brandParts = [
    item.brand?.name,
    item.product?.name,
    item.product_variant?.name,
  ].filter(Boolean)
  const weightStr = item.weight ? `${item.weight} ${item.unit}` : null
  const subtitle = [brandParts.join(' '), weightStr].filter(Boolean).join(' \u2014 ')

  return (
    <li>
      <button
        onClick={() => onClick(item)}
        className="group flex items-center gap-1.5 py-1 px-2 w-full text-left rounded-sm cursor-pointer transition-colors hover:bg-accent"
      >
        <span className="shrink-0 w-2 flex items-center justify-center">
          {selected && (
            <CircleIcon className="fill-primary stroke-primary" size={6} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold truncate text-foreground">
            {item.name}
          </div>
          {subtitle && (
            <div className="text-[11px] text-muted-foreground truncate">
              {subtitle}
            </div>
          )}
        </div>
        <span className="shrink-0 rounded-sm p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {selected ? <Plus size={14} className="rotate-45" /> : <Plus size={14} />}
        </span>
      </button>
    </li>
  )
}
