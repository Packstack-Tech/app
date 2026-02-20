import { FC, useState } from 'react'

import { Button } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Dropzone } from '@/components/ui/Dropzone'
import { useImportLighterpack } from '@/queries/item'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ImportLighterpackModal: FC<Props> = ({ open, onOpenChange }) => {
  const importInventory = useImportLighterpack()
  const [file, setFile] = useState<File | null>(null)

  const onUpload = () => {
    if (!file) return
    importInventory.mutate({ file })
    setFile(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-xl">
        <DialogHeader>
          <DialogTitle>Import LighterPack</DialogTitle>
        </DialogHeader>
        <DialogDescription className="mx-6 mt-4">
          Import your gear from LighterPack by uploading your CSV export.
        </DialogDescription>
        <div className="mx-6 mb-4">
          <Dropzone fileExtension="csv" onChange={setFile} />
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setFile(null)
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button onClick={onUpload} disabled={!file}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
