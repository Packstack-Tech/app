import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { shallow } from "zustand/shallow"
import Fuse from "fuse.js"

import { ItemForm } from "@/containers/ItemForm"
import { Button, Input } from "@/components/ui"
import { Label } from "@/components/ui/Label"
import { useCategorizedItems } from "@/hooks/useCategorizedItems"
import { InventoryItem } from "../Trip/InventoryItem"
import { useTripPacks } from "@/hooks/useTripPacks"
import { Item } from "@/types/item"

export const InventorySidebar = () => {
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { packs, selectedIndex, addItem, removeItem } = useTripPacks(
    (state) => ({
      packs: state.packs,
      selectedIndex: state.selectedIndex,
      addItem: state.addItem,
      removeItem: state.removeItem,
    }),
    shallow
  )
  const items = useCategorizedItems()
  // TODO causes bug using <Link> to navigate to /pack/:id
  const selectedItems = packs[selectedIndex].items

  const fuseItems = useMemo(
    () =>
      new Fuse(items, {
        keys: ["items.name", "items.product.name"],
      }),
    [items]
  )

  const filteredItems = useMemo(() => {
    if (!search) return items
    return fuseItems.search(search).map((result) => result.item)
  }, [items, fuseItems, search])

  const onSelect = (item: Item) => {
    const existingItem = selectedItems.find((i) => i.item_id === item.id)
    if (existingItem) {
      removeItem(item.id)
    } else {
      addItem({
        item: { ...item },
        item_id: item.id,
        sort_order: 0,
        quantity: 1,
        worn: false,
        checked: false,
      })
    }
  }

  return (
    <>
      <div className="flex justify-between mb-1">
        <h3>Inventory</h3>
        <Button
          variant="outline"
          className="flex gap-1 items-center px-2"
          size="sm"
          onClick={() => setAddItemOpen(true)}
        >
          <Plus size={12} /> <span>Add Gear</span>
        </Button>
      </div>
      <div className="mb-2">
        <Input
          placeholder="search gear..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {filteredItems.map((category) => (
        <div
          key={category.category?.category_id || "undefined"}
          className="mb-2"
        >
          <Label className="text-primary text-xs">
            {category.category?.category.name || "Uncategorized"}
          </Label>
          <ul>
            {category.items.map((item) => {
              const selected = !!selectedItems.find(
                (rec) => rec.item_id === item.id
              )
              return (
                <InventoryItem
                  key={item.id}
                  item={item}
                  onClick={onSelect}
                  selected={selected}
                />
              )
            })}
          </ul>
        </div>
      ))}
      <ItemForm
        title="Add Gear"
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        onClose={() => setAddItemOpen(false)}
      />
    </>
  )
}
