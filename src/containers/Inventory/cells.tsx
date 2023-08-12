import { FC, useState } from "react"
import { Cell } from "@tanstack/react-table"

import { Button } from "@/components/ui"
import { Item } from "@/types/item"
import { DialogTrigger } from "@/components/ui/Dialog"

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
