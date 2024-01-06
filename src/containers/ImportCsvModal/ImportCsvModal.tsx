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
import { downloadTemplate } from '@/lib/download'
import { useImportInventory } from '@/queries/item'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ImportCsvModal: FC<Props> = ({ open, onOpenChange }) => {
  const importInventory = useImportInventory()
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
          <DialogTitle>Import CSV</DialogTitle>
        </DialogHeader>
        <DialogDescription className="mx-4 mt-4">
          <p>
            Import your gear from a CSV file.{' '}
            <em>Only the name field is required.</em>
          </p>
          <Button
            variant="link"
            size="none"
            className="my-4"
            onClick={() => downloadTemplate()}
          >
            Download template
          </Button>
          <p className="text-slate-100 text-lg">Available Fields</p>
          <ul>
            <li>
              <strong>name</strong> - item name (required)
            </li>
            <li>
              <strong>manufacturer</strong> - company that makes the item
            </li>
            <li>
              <strong>product</strong> - product field requires a manufacturer
              or is skipped
            </li>
            <li>
              <strong>category</strong> - new or existing category
            </li>
            <li>
              <strong>weight</strong> - number
            </li>
            <li>
              <strong>unit</strong> - oz, lb, g, kg
            </li>
            <li>
              <strong>price</strong> - number
            </li>
            <li>
              <strong>consumable</strong> - leave empty if not consumable
            </li>
            <li>
              <strong>product_url</strong> - link to product page
            </li>
            <li>
              <strong>notes</strong> - any notes about the item
            </li>
          </ul>
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
