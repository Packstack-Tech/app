import { FC } from 'react'

import { Item } from '@/types/item'

interface Props {
  item: Item
  selected: boolean
  onClick: (item: Item) => void
}

export const InventoryItem: FC<Props> = ({ item, selected, onClick }) => (
  <li className="mb-1">
    <button
      onClick={() => onClick(item)}
      className={`p-1 pl-2 w-full rounded-sm text-left border-l-2 hover:bg-muted/50 ${
        selected ? 'border-l-primary bg-primary/10 dark:bg-primary/5' : 'border-l-transparent'
      }`}
    >
      <div className="text-foreground text-xs font-semibold">
        {item.name}
      </div>
      <div className="text-muted-foreground text-xs">
        {item.brand?.name} {item.product?.name} {item.product_variant?.name}
      </div>
      {!!item.weight && (
        <div className="text-muted-foreground text-xs">
          {item.weight} {item.unit}
        </div>
      )}
    </button>
  </li>
)
