import { FC, useState } from 'react'

import { Button } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

interface Props {
  title: string
  open: boolean
  onClose: () => void
  onSave: (title: string) => void
}

export const EditPackDialog: FC<Props> = ({ title, open, onClose, onSave }) => {
  const [value, setValue] = useState(title)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit pack</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4">
          <div className="grid gap-1">
            <Label htmlFor="edit-pack-title">Pack Name</Label>
            <Input
              id="edit-pack-title"
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={() => onSave(value)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
