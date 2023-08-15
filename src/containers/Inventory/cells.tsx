import { FC, useState } from "react"
import { FlameIcon, StickyNoteIcon } from "lucide-react"
import { Cell } from "@tanstack/react-table"

import { Button } from "@/components/ui"
import { Item } from "@/types/item"
import { DialogTrigger } from "@/components/ui/Dialog"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/Popover"

import { ItemForm } from "@/containers/ItemForm"

type Props = {
  cell: Cell<Item, unknown>
}

export const Action: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  const [open, setOpen] = useState(false)
  return (
    <ItemForm
      title="Edit Item"
      open={open}
      onOpenChange={setOpen}
      item={original}
      onClose={() => setOpen(false)}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
    </ItemForm>
  )
}

export const ConsumableCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  if (!original.consumable) return null

  return <FlameIcon color="orange" size={20} strokeWidth={1} />
}

export const NotesCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  if (!original.notes) return null

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
      <PopoverContent className="w-[120px]" align="center">
        <p>{original.notes}</p>
      </PopoverContent>
    </Popover>
  )
}