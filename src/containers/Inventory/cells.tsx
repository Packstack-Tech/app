'use client'

import { FC, useState } from 'react'
import { Cell } from '@tanstack/react-table'

import { Button } from '@/components/ui'
import { Item } from '@/types/item'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle
} from '@/components/ui/Dialog'

import { ItemForm } from '../../../../components/ItemForm/ItemForm'

type Props = {
  cell: Cell<Item, unknown>
}

export const Action: FC<Props> = ({
  cell: {
    row: { original }
  }
}) => {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <ItemForm item={original} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
