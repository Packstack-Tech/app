import { FC, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui"

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
          <DialogTitle>Rename pack</DialogTitle>
        </DialogHeader>
        <div className="p-2">
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <DialogFooter className="flex justify-between">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={() => onSave(value)} variant="secondary">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
