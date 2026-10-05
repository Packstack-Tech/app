import { FC, useEffect, useState } from 'react'
import { FlameIcon, MinusIcon, PlusIcon, StickyNoteIcon, XCircleIcon } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { Cell } from '@tanstack/react-table'

import { OverpackBadge } from '@/components/OverpackBadge'
import { PackMembershipBadge } from '@/components/PackMembershipBadge'
import { Input } from '@/components/ui'
import { DialogTrigger } from '@/components/ui/Dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { ItemForm } from '@/containers/ItemForm'
import { useTripPacks } from '@/hooks/useTripPacks'
import { useUser } from '@/hooks/useUser'
import { Mixpanel } from '@/lib/mixpanel'
import { ownedQuantity } from '@/lib/overpack'
import { formatItemWeight, getItemDisplayUnit } from '@/lib/weight'
import { wornQuantity } from '@/lib/worn'
import { ItemForm as ItemFormValues, Unit } from '@/types/item'
import { PackItem } from '@/types/pack'

import { useOverpackContext } from './overpackContext'
import { usePackMembershipContext } from './packMembershipContext'

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
  const membership = usePackMembershipContext()
  const otherPacks = membership.get(original.item_id)
  const overpack = useOverpackContext().byItem.get(original.item_id)

  const handleSave = (data: ItemFormValues) => {
    const { itemname, ...rest } = data
    updateBaseItem(original.item.id, {
      name: itemname,
      weight: rest.weight,
      unit: rest.unit as Unit,
      price: rest.price,
      quantity: rest.quantity,
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
      <div className="flex items-center gap-1.5">
        <DialogTrigger asChild>
          <button className="text-left hover:underline cursor-pointer">
            {original.item.name}
          </button>
        </DialogTrigger>
        <PackMembershipBadge packNames={otherPacks} />
        <OverpackBadge status={overpack} />
      </div>
    </ItemForm>
  )
}

export const QuantityCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  const { updateItem, selectedIndex } = useTripPacks(
    useShallow(store => ({ updateItem: store.updateItem, selectedIndex: store.selectedIndex }))
  )
  const overpack = useOverpackContext()
  const [value, setValue] = useState(original.quantity.toString())
  const [error, setError] = useState(false)
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let quantity = parseFloat(e.target.value.trim())
    if (isNaN(quantity)) {
      setError(true)
      return
    }
    setError(false)
    // Block mode: never let this pack push the trip-wide total past what the
    // user owns. Clamp rather than refuse so the field still lands on a value.
    if (!overpack.canSet(original.item_id, selectedIndex, quantity)) {
      const max = overpack.maxFor(original.item_id, selectedIndex, ownedQuantity(original.item))
      Mixpanel.track('Overpack:AddBlocked', {
        item_id: original.item_id,
        requested: quantity,
        allowed: max,
        source: 'quantity-cell',
      })
      quantity = max
      setValue(quantity.toString())
    }
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

  if (original.item.consumable) {
    return (
      <div className="flex justify-center">
        <FlameIcon className="stroke-muted-foreground" size={14} strokeWidth={1.5} />
      </div>
    )
  }

  const worn = wornQuantity(original)

  // One unit (or less): today's toggle.
  if (original.quantity <= 1) {
    const onClick = () => updateItem(original.item_id, 'worn', !original.worn)
    return (
      <div className="flex justify-center">
        <button
          onClick={onClick}
          className={`cursor-pointer text-[10px] capitalize leading-none px-1.5 py-0.5 rounded-full transition-colors ${
            worn > 0
              ? 'bg-primary text-primary-foreground'
              : 'border border-border text-muted-foreground'
          }`}
        >
          worn
        </button>
      </div>
    )
  }

  // Several units: how many of them are worn (1 of 5 shirts). The column is
  // narrow, so the pill opens a stepper instead of holding one inline.
  const maxWorn = Math.floor(original.quantity)
  const setWorn = (next: number) => {
    const clamped = Math.max(0, Math.min(next, maxWorn))
    if (clamped === worn) return
    updateItem(original.item_id, 'worn_quantity', clamped)
    Mixpanel.track('PackItem:WornQuantitySet', {
      quantity: original.quantity,
      worn_quantity: clamped,
      previous: worn,
      source: 'worn-cell',
    })
  }

  return (
    <div className="flex justify-center">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={`cursor-pointer text-[10px] leading-none px-1.5 py-0.5 rounded-full tabular-nums transition-colors ${
              worn > 0
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-muted-foreground'
            }`}
            aria-label={`${worn} of ${original.quantity} worn`}
          >
            {worn > 0 ? `${worn}/${original.quantity}` : 'worn'}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">
              How many of the {original.quantity} are worn?
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setWorn(worn - 1)}
                disabled={worn <= 0}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border disabled:opacity-40"
                aria-label="Wear one fewer"
              >
                <MinusIcon size={14} />
              </button>
              <span className="min-w-12 text-center text-sm font-medium tabular-nums">
                {worn} of {original.quantity}
              </span>
              <button
                type="button"
                onClick={() => setWorn(worn + 1)}
                disabled={worn >= maxWorn}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border disabled:opacity-40"
                aria-label="Wear one more"
              >
                <PlusIcon size={14} />
              </button>
            </div>
            <span className="text-[11px] text-muted-foreground">
              The rest count toward base weight.
            </span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
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
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <StickyNoteIcon
          size={20}
          strokeWidth={1}
          className="inline-block hover:cursor-default stroke-sky-600 dark:stroke-sky-200"
        />
      </TooltipTrigger>
      <TooltipContent
        align="center"
        className="max-w-[320px] p-3 text-left text-sm whitespace-pre-wrap text-wrap bg-popover text-foreground border shadow-md [&>span]:hidden"
      >
        {item.notes}
      </TooltipContent>
    </Tooltip>
  )
}

export const WeightCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  const user = useUser()
  const { displayUnitSystem } = useTripPacks(
    useShallow(store => ({ displayUnitSystem: store.displayUnitSystem }))
  )
  const { item } = original
  if (!item.weight) return '-'

  const effectiveSystem = displayUnitSystem ?? user.unit_weight
  const targetUnit = getItemDisplayUnit(effectiveSystem)
  const formatted = formatItemWeight(item.weight, item.unit, targetUnit)

  return (
    <div className="flex pl-1 whitespace-nowrap">
      <span className="ml-auto">{formatted}</span>
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
      className="text-muted-foreground mt-1.5 hover:text-foreground cursor-pointer"
    >
      <XCircleIcon size={16} strokeWidth={1} />
    </button>
  )
}
