import { useState } from "react"
import { Button } from "@/components/ui"
import { InventoryTable } from "@/containers/Inventory/InventoryTable"
import { ItemForm } from "@/containers/ItemForm"
import { DialogTrigger } from "@/components/ui/Dialog"

export const InventoryPage = () => {
  const [open, setOpen] = useState(false)
  return (
    <div className="p-4">
      <div className="flex justify-end mb-2">
        <ItemForm
          title="New Item"
          open={open}
          onOpenChange={setOpen}
          onClose={() => setOpen(false)}
        >
          <DialogTrigger asChild>
            <Button>Add Gear</Button>
          </DialogTrigger>
        </ItemForm>
      </div>
      <InventoryTable />
    </div>
  )
}
