"use client"

import { FC } from "react"
import { Cell } from "@tanstack/react-table"

import { Input } from "@/components/ui"
import { PackItem } from "@/types/pack"
import { useTripPacks } from "@/hooks/useTripPacks"
import { shallow } from "zustand/shallow"
import { FlameIcon } from "lucide-react"

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

  return (
    <Input
      type="number"
      step=".01"
      value={original.quantity}
      className="pr-2"
      onChange={(e) => updateItem(original.item_id, "quantity", e.target.value)}
    />
  )
}

export const ConsumableCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  const { updateItem } = useTripPacks(
    (store) => ({ updateItem: store.updateItem }),
    shallow
  )

  const onClick = () => updateItem(original.item_id, "worn", !original.worn)

  return (
    <button onClick={onClick}>
      <FlameIcon
        color={original.worn ? "orange" : "gray"}
        size={20}
        fill={original.worn ? "orange" : undefined}
        strokeWidth={1}
      />
    </button>
  )
}
