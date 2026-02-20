import { FC, useEffect, useState } from 'react'
import { FlameIcon, ShirtIcon, StickyNoteIcon, XCircleIcon } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { Cell } from '@tanstack/react-table'

import { Input } from '@/components/ui'
import { DialogTrigger } from '@/components/ui/Dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import { ItemForm } from '@/containers/ItemForm'
import { useTripPacks } from '@/hooks/useTripPacks'
import { ItemForm as ItemFormValues, Unit } from '@/types/item'
import { PackItem } from '@/types/pack'

type Props = {
  cell: Cell<PackItem, unknown>
}

export const NameCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  const [open, setOpen] = useState(false)
  const { updateBaseItem } = useTripPacks(
    useShallow(store => ({ updateBaseItem: store.updateBaseItem }))
  )

  const handleSave = (data: ItemFormValues) => {
    const { itemname, ...rest } = data
    updateBaseItem(original.item.id, {
      name: itemname,
      weight: rest.weight,
      unit: rest.unit as Unit,
      price: rest.price,
      consumable: rest.consumable,
      notes: rest.notes,
      product_url: rest.product_url,
      category_id: rest.category_id,
      brand_id: rest.brand_id,
      product_id: rest.product_id,
      product_variant_id: rest.product_variant_id,
    })
  }

  return (
    <ItemForm
      title="Edit Item"
      open={open}
      onOpenChange={setOpen}
      item={original.item}
      onClose={() => setOpen(false)}
      onSave={handleSave}
    >
      <DialogTrigger asChild>
        <button className="text-left hover:underline cursor-pointer">
          {original.item.name}
        </button>
      </DialogTrigger>
    </ItemForm>
  )
}

export const QuantityCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  const { updateItem } = useTripPacks(
    useShallow(store => ({ updateItem: store.updateItem }))
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
    updateItem(original.item_id, 'quantity', quantity)
  }

  useEffect(() => {
    setValue(original.quantity.toString())
  }, [original.quantity])

  return (
    <Input
      value={value}
      className={`px-2 py-1 h-auto ${error ? 'border-red-500' : ''}`}
      onBlur={onChange}
      onChange={e => setValue(e.target.value)}
    />
  )
}

export const WornCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  const { updateItem } = useTripPacks(
    useShallow(store => ({ updateItem: store.updateItem }))
  )

  const onClick = () => updateItem(original.item_id, 'worn', !original.worn)

  if (original.item.consumable) return null

  return (
    <button onClick={onClick} className="cursor-pointer">
      <ShirtIcon
        className={
          original.worn
            ? 'fill-primary stroke-primary'
            : 'stroke-slate-300 dark:stroke-slate-600'
        }
        size={20}
        strokeWidth={1.5}
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
          size={20}
          strokeWidth={1}
          className="hover:cursor-pointer stroke-sky-600 dark:stroke-sky-200"
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
  if (!item.weight) return '-'
  const displayWeight = ['g', 'oz'].includes(item.unit)
    ? item.weight
    : item.weight.toFixed(2)
  return (
    <div className="flex pl-1">
      {item.consumable && (
        <FlameIcon
          className="stroke-black dark:stroke-white mr-auto"
          size={16}
          strokeWidth={1}
        />
      )}
      <span className="ml-auto">
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
    useShallow(store => ({ removeItem: store.removeItem }))
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
