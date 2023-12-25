import { FC, useState } from "react"
import { Cell } from "@tanstack/react-table"

import { Input } from "@/components/ui"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/Popover"
import { PackItem } from "@/types/pack"
import { useTripPacks } from "@/hooks/useTripPacks"
import { shallow } from "zustand/shallow"
import { FlameIcon, ShirtIcon, StickyNoteIcon, XCircleIcon } from "lucide-react"

type Props = {
  cell: Cell<PackItem, unknown>
}

export const QuantityCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  const { updateItem } = useTripPacks(
    (store) => ({ updateItem: store.updateItem }),
    shallow
  )
  const [value, setValue] = useState(original.quantity.toString())
  const [error, setError] = useState(false)
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseFloat(e.target.value.trim())
    if (isNaN(quantity)) {
      setError(true)
      return
    }
    setError(false)
    updateItem(original.item_id, "quantity", quantity)
  }

  return (
    <Input
      value={value}
      className={`px-2 py-1 h-auto ${error ? "border-red-500" : ""}`}
      onBlur={onChange}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

export const WornCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  const { updateItem } = useTripPacks(
    (store) => ({ updateItem: store.updateItem }),
    shallow
  )

  const onClick = () => updateItem(original.item_id, "worn", !original.worn)

  if (original.item.consumable) return null

  return (
    <button onClick={onClick}>
      <ShirtIcon
        color={original.worn ? "white" : "#555"}
        size={20}
        strokeWidth={1}
      />
    </button>
  )
}

export const NotesCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  const { item } = original
  if (!item.notes) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <StickyNoteIcon
          color="lightblue"
          size={20}
          strokeWidth={1}
          className="hover:cursor-pointer"
        />
      </PopoverTrigger>
      <PopoverContent
        className="w-[240px] p-2 text-left text-xs"
        align="center"
      >
        <p>{item.notes}</p>
      </PopoverContent>
    </Popover>
  )
}

export const WeightCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  const { item } = original
  if (!item.weight) return "-"
  const displayWeight = ["g", "oz"].includes(item.unit)
    ? item.weight
    : item.weight.toFixed(2)
  return (
    <div className="inline-flex items-center gap-1">
      {item.consumable && <FlameIcon color="white" size={16} strokeWidth={1} />}
      <span>
        {displayWeight} {item.unit}
      </span>
    </div>
  )
}

export const RemoveItemCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  const { removeItem } = useTripPacks(
    (store) => ({ removeItem: store.removeItem }),
    shallow
  )

  return (
    <button
      onClick={() => removeItem(original.item_id)}
      className="text-slate-300 mt-1.5 hover:text-slate-100"
    >
      <XCircleIcon size={16} strokeWidth={1} />
    </button>
  )
}
