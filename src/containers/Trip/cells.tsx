import { FC, useState } from "react"
import { Cell } from "@tanstack/react-table"

import { Input } from "@/components/ui"
import { PackItem } from "@/types/pack"
import { useTripPacks } from "@/hooks/useTripPacks"
import { shallow } from "zustand/shallow"
import { FlameIcon, ShirtIcon } from "lucide-react"

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

export const ConsumableCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  if (!original.item.consumable) return <div className="w-[20px]" />

  return <FlameIcon color="white" size={20} strokeWidth={1} />
}
