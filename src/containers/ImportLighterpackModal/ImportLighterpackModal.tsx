import { useState, FC } from "react"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Dialog"
import { Dropzone } from "@/components/ui/Dropzone"
import { useImportLighterpack } from "@/queries/item"
import { Button } from "@/components/ui"

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
      <DialogContent className="w-1/2">
        <DialogHeader>
          <DialogTitle>Import Lighterpack</DialogTitle>
        </DialogHeader>
        <DialogDescription className="mx-4 mt-4">
          Import your gear from Lighterpack by uploading your CSV export.
        </DialogDescription>
        <div className="m-4">
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
