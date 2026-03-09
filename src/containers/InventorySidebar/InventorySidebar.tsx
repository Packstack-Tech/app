import { useMemo, useState } from 'react'
import { PackagePlus, Plus } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import { Button, Input } from '@/components/ui'
import { Label } from '@/components/ui/Label'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { ItemForm } from '@/containers/ItemForm'
import { useCategorizedItems } from '@/hooks/useCategorizedItems'
import { useToast } from '@/hooks/useToast'
import { useTripPacks } from '@/hooks/useTripPacks'
import { Mixpanel } from '@/lib/mixpanel'
import { useKits } from '@/queries/kit'
import { Item } from '@/types/item'
import { Kit } from '@/types/kit'

import { InventoryItem } from '../Trip/InventoryItem'

export const InventorySidebar = () => {
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [kitSearch, setKitSearch] = useState('')
  const { packs, selectedIndex, addItem, removeItem } = useTripPacks(
    useShallow(state => ({
      packs: state.packs,
      selectedIndex: state.selectedIndex,
      addItem: state.addItem,
      removeItem: state.removeItem,
    }))
  )
  const items = useCategorizedItems({ filter: search })
  const selectedItems = packs[selectedIndex].items
  const { data: kits } = useKits()
  const { toast } = useToast()

  const filteredKits = useMemo(() => {
    if (!kits) return []
    if (!kitSearch.trim()) return kits
    const q = kitSearch.toLowerCase()
    return kits.filter(kit => kit.name.toLowerCase().includes(q))
  }, [kits, kitSearch])

  const onSelect = (item: Item) => {
    const existingItem = selectedItems.find(i => i.item_id === item.id)
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

  const onLoadKit = (kit: Kit) => {
    let added = 0
    for (const kitItem of kit.items) {
      if (kitItem.item.removed) continue
      const exists = selectedItems.find(i => i.item_id === kitItem.item_id)
      if (exists) continue

      addItem({
        item: { ...kitItem.item },
        item_id: kitItem.item_id,
        sort_order: 0,
        quantity: kitItem.quantity,
        worn: false,
        checked: false,
      })
      added++
    }

    if (added > 0) {
      toast({
        title: `Loaded ${kit.name}`,
        description: `${added} ${added === 1 ? 'item' : 'items'} added to pack`,
      })
    } else {
      toast({
        title: `All items from ${kit.name} are already in this pack`,
      })
    }
    Mixpanel.track('Kit:Load', { kit_id: kit.id, items_added: added })
  }

  return (
    <Tabs defaultValue="inventory" className="flex flex-col h-full">
      <TabsList className="w-full shrink-0">
        <TabsTrigger value="inventory" className="flex-1">
          Inventory
        </TabsTrigger>
        <TabsTrigger value="kits" className="flex-1">
          Kits
        </TabsTrigger>
      </TabsList>

      <TabsContent value="inventory" className="flex flex-col min-h-0 flex-1">
        <div className="mb-2 relative">
          <Input
            placeholder="search gear..."
            onChange={e => setSearch(e.target.value)}
            className="pr-8"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  setAddItemOpen(true)
                  Mixpanel.track('Trip:Inventory:Add gear button:tapped')
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Create Gear</TooltipContent>
          </Tooltip>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          {items.length === 0 && search && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No gear matching "{search}"
            </div>
          )}
          {items.map(category => (
            <div key={category.category?.category_id || 'undefined'}>
              <Label className="text-muted-foreground text-xs rounded-sm bg-muted mb-1 p-1 block">
                {category.category?.category.name || 'Uncategorized'}
              </Label>
              <ul>
                {category.items.map(item => {
                  const selected = !!selectedItems.find(
                    rec => rec.item_id === item.id
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
        </ScrollArea>
        <ItemForm
          title="Add Gear"
          open={addItemOpen}
          onOpenChange={setAddItemOpen}
          onClose={() => setAddItemOpen(false)}
        />
      </TabsContent>

      <TabsContent value="kits" className="flex flex-col min-h-0 flex-1">
        <div className="mb-2">
          <Input
            placeholder="search kits..."
            value={kitSearch}
            onChange={e => setKitSearch(e.target.value)}
          />
        </div>
        <ScrollArea className="flex-1 min-h-0">
          {filteredKits.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              {kits && kits.length > 0 ? (
                <p>No kits matching "{kitSearch}"</p>
              ) : (
                <>
                  <p>No kits yet.</p>
                  <p className="mt-1">
                    Create kits from the Kits page to load them here.
                  </p>
                </>
              )}
            </div>
          )}
          {filteredKits.map(kit => (
            <div
              key={kit.id}
              className="border border-border rounded-md mb-2 overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{kit.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {kit.items.length}{' '}
                    {kit.items.length === 1 ? 'item' : 'items'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 shrink-0"
                  onClick={() => onLoadKit(kit)}
                >
                  <PackagePlus size={14} />
                  <span className="text-xs">Load</span>
                </Button>
              </div>
              {kit.items.length > 0 && (
                <div className="border-t border-border px-3 py-1.5">
                  {kit.items.map(ki => (
                    <div
                      key={ki.item_id}
                      className="text-xs text-muted-foreground py-0.5 flex justify-between"
                    >
                      <span className="truncate">{ki.item.name}</span>
                      {ki.quantity > 1 && (
                        <span className="tabular-nums shrink-0 ml-2">
                          {ki.quantity}x
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )
}
