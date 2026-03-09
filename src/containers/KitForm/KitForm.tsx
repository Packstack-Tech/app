import { FC, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Minus, Plus, Trash2Icon, X } from 'lucide-react'

import { Button, Input } from '@/components/ui'
import { Label } from '@/components/ui/Label'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { useCategorizedItems } from '@/hooks/useCategorizedItems'
import { useCreateKit, useDeleteKit, useUpdateKit } from '@/queries/kit'
import { Item } from '@/types/item'
import { Kit, KitItemPayload } from '@/types/kit'

type Props = {
  kit?: Kit
  onBack: () => void
}

export const KitEditor: FC<Props> = ({ kit, onBack }) => {
  const [name, setName] = useState('')
  const [selectedItems, setSelectedItems] = useState<
    Map<number, { item: Item; quantity: number }>
  >(new Map())
  const [search, setSearch] = useState('')

  const createKit = useCreateKit()
  const updateKit = useUpdateKit()
  const deleteKit = useDeleteKit()

  const categories = useCategorizedItems({ filter: search })

  useEffect(() => {
    if (kit) {
      setName(kit.name)
      const items = new Map<number, { item: Item; quantity: number }>()
      kit.items.forEach(ki => {
        items.set(ki.item_id, { item: ki.item, quantity: ki.quantity })
      })
      setSelectedItems(items)
    } else {
      setName('')
      setSelectedItems(new Map())
    }
    setSearch('')
  }, [kit])

  const itemPayloads = useMemo((): KitItemPayload[] => {
    return Array.from(selectedItems.entries()).map(([item_id, { quantity }]) => ({
      item_id,
      quantity,
    }))
  }, [selectedItems])

  const onSave = () => {
    if (!name.trim()) return
    const payload = { name: name.trim(), items: itemPayloads }

    if (kit) {
      updateKit.mutate({ id: kit.id, data: payload }, { onSuccess: onBack })
    } else {
      createKit.mutate(payload, { onSuccess: onBack })
    }
  }

  const onDelete = () => {
    if (!kit) return
    deleteKit.mutate(kit.id, { onSuccess: onBack })
  }

  const toggleItem = (item: Item) => {
    setSelectedItems(prev => {
      const next = new Map(prev)
      if (next.has(item.id)) {
        next.delete(item.id)
      } else {
        next.set(item.id, { item, quantity: 1 })
      }
      return next
    })
  }

  const removeItem = (itemId: number) => {
    setSelectedItems(prev => {
      const next = new Map(prev)
      next.delete(itemId)
      return next
    })
  }

  const updateQuantity = (itemId: number, delta: number) => {
    setSelectedItems(prev => {
      const next = new Map(prev)
      const entry = next.get(itemId)
      if (!entry) return prev
      const newQty = Math.max(1, entry.quantity + delta)
      next.set(itemId, { ...entry, quantity: newQty })
      return next
    })
  }

  const isPending =
    createKit.isPending || updateKit.isPending || deleteKit.isPending

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-border shrink-0">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowLeft size={18} />
        </Button>
        <Input
          placeholder="Kit name..."
          value={name}
          onChange={e => setName(e.target.value)}
          className="max-w-xs"
          autoFocus
        />
        <div className="ml-auto flex items-center gap-2">
          {kit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={isPending}
            >
              <Trash2Icon className="size-3.5" />
              Delete
            </Button>
          )}
          <Button size="sm" onClick={onSave} disabled={!name.trim() || isPending}>
            {kit ? 'Save Changes' : 'Create Kit'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left panel — Kit items */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-border">
          <div className="px-4 py-2 border-b border-border shrink-0">
            <Label className="text-xs text-muted-foreground">
              Kit Items ({selectedItems.size})
            </Label>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            {selectedItems.size === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Select items from inventory to add them to this kit.
              </div>
            )}
            <div className="divide-y divide-border">
              {Array.from(selectedItems.entries()).map(
                ([itemId, { item, quantity }]) => (
                  <div
                    key={itemId}
                    className="flex items-center justify-between px-4 py-2"
                  >
                    <div className="min-w-0 mr-2">
                      <div className="text-sm font-medium truncate">
                        {item.name}
                      </div>
                      {(item.brand?.name || item.product?.name) && (
                        <div className="text-xs text-muted-foreground truncate">
                          {item.brand?.name} {item.product?.name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(itemId, -1)}
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="text-sm w-6 text-center tabular-nums">
                        {quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(itemId, 1)}
                      >
                        <Plus size={14} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(itemId)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right panel — Inventory */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 py-2 border-b border-border shrink-0">
            <Input
              placeholder="Search gear..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ScrollArea className="flex-1 min-h-0">
            {categories.map(category => (
              <div key={category.category?.category_id || 'uncategorized'}>
                <div className="text-muted-foreground text-xs bg-muted p-1 px-3 sticky top-0">
                  {category.category?.category.name || 'Uncategorized'}
                </div>
                {category.items.map(item => {
                  const isSelected = selectedItems.has(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(item)}
                      className={`w-full text-left px-4 py-2 hover:bg-muted/50 border-l-2 ${
                        isSelected
                          ? 'border-l-primary bg-primary/10 dark:bg-primary/5'
                          : 'border-l-transparent'
                      }`}
                    >
                      <div className="text-sm font-medium">{item.name}</div>
                      {(item.brand?.name || item.product?.name) && (
                        <div className="text-muted-foreground text-xs">
                          {item.brand?.name} {item.product?.name}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
            {categories.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No items found
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
