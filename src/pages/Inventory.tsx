import { useState } from "react"
import { Button, Input } from "@/components/ui"
import { InventoryTable } from "@/containers/Inventory/InventoryTable"
import { UpdateCategoryOrder } from "@/containers/UpdateCategoryOrder"
import { ItemForm } from "@/containers/ItemForm"
import { DialogTrigger } from "@/components/ui/Dialog"

export const InventoryPage = () => {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState("")
  return (
    <div className="p-4">
      <div className="flex justify-between mb-2">
        <Input
          placeholder="Search gear..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex justify-end gap-2">
          <UpdateCategoryOrder />
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
      </div>
      <InventoryTable searchFilter={filter} />
    </div>
  )
}
