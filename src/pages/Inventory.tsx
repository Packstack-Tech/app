import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'

import { Button, Input } from '@/components/ui'
import { DialogTrigger } from '@/components/ui/Dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { CategoryManagementModal } from '@/containers/CategoryManagementModal'
import { ImportCsvModal } from '@/containers/ImportCsvModal'
import { ImportLighterpackModal } from '@/containers/ImportLighterpackModal'
import { CategoryList } from '@/containers/Inventory/CategoryList'
import { InventoryTable } from '@/containers/Inventory/InventoryTable'
import { ItemForm } from '@/containers/ItemForm'
import { downloadInventory } from '@/lib/download'
import { useInventory } from '@/queries/item'

export const InventoryPage = () => {
  const { data: inventory, isLoading } = useInventory()
  const [open, setOpen] = useState(false)
  const [openReorder, setOpenReorder] = useState(false)
  const [openLighterpackImport, setOpenLighterpackImport] = useState(false)
  const [openCsvmport, setOpenCsvImport] = useState(false)
  const [filter, setFilter] = useState('')

  return (
    <div className="px-2 md:px-4 py-2">
      <div className="flex justify-between mb-2 gap-2">
        <Input
          placeholder="Search gear..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex justify-end items-center gap-2">
          <ItemForm
            title="New Item"
            open={open}
            onOpenChange={setOpen}
            onClose={() => setOpen(false)}
          >
            <DialogTrigger asChild>
              <Button className="md:text-sm">Add Gear</Button>
            </DialogTrigger>
          </ItemForm>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setOpenLighterpackImport(true)}>
                Import from LighterPack
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenCsvImport(true)}>
                Import CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadInventory(inventory)}>
                Export Inventory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenReorder(true)}>
                Manage Categories
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ImportLighterpackModal
        open={openLighterpackImport}
        onOpenChange={setOpenLighterpackImport}
      />
      <ImportCsvModal open={openCsvmport} onOpenChange={setOpenCsvImport} />
      <CategoryManagementModal
        open={openReorder}
        onOpenChange={setOpenReorder}
      />
      <div className="flex gap-4">
        <div className="flex-1">
          <InventoryTable searchFilter={filter} isLoading={isLoading} />
        </div>
        <CategoryList />
      </div>
    </div>
  )
}
