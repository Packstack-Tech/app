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
  open: boolean
  onClose: () => void
  onSave: (title: string) => void
}

export const NewPackDialog: FC<Props> = ({ open, onClose, onSave }) => {
  const [title, setTitle] = useState('')

  const reset = () => setTitle('')

  const handleSave = () => {
    const name = title.trim()
    if (!name) return
    onSave(name)
    reset()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) {
          reset()
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Pack</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4">
          <div className="grid gap-1">
            <Label htmlFor="pack-title">Pack Name</Label>
            <Input
              id="pack-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Main Pack"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            onClick={() => {
              reset()
              onClose()
            }}
            variant="outline"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
