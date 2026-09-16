import { useMemo, useState } from 'react'
import { ChevronRight, Package, Pencil, PlusIcon } from 'lucide-react'

import { EmptyState } from '@/components/EmptyState'
import { Button, Input } from '@/components/ui'
import { KitEditor } from '@/containers/KitForm'
import { useKitLimit } from '@/hooks/useKitLimit'
import { cn } from '@/lib/utils'
import { useKits } from '@/queries/kit'
import { Kit } from '@/types/kit'

type View = { mode: 'list' } | { mode: 'editor'; kit?: Kit }

export const KitsPage = () => {
  const { data: kits, isLoading } = useKits()
  const { canCreateKit, openUpgrade } = useKitLimit()
  const [view, setView] = useState<View>({ mode: 'list' })
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const handleCreate = () => {
    if (canCreateKit) {
      setView({ mode: 'editor' })
    } else {
      openUpgrade()
    }
  }

  const filteredKits = useMemo(() => {
    if (!kits) return []
    if (!search.trim()) return kits
    const q = search.toLowerCase()
    return kits.filter(kit => kit.name.toLowerCase().includes(q))
  }, [kits, search])

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (view.mode === 'editor') {
    return (
      <KitEditor
        kit={view.kit}
        onBack={() => setView({ mode: 'list' })}
      />
    )
  }

  const total = kits?.length ?? 0

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1>Kits</h1>
          <p className="text-sm mt-0.5">
            {total === 0
              ? 'Reusable bundles of gear to drop into any pack.'
              : `${total} ${total === 1 ? 'kit' : 'kits'}`}
          </p>
        </div>
        {total > 0 && (
          <Button size="sm" className="gap-1" onClick={handleCreate}>
            <PlusIcon size={14} /> New Kit
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground">Loading...</div>
      )}

      {!isLoading && total === 0 && (
        <EmptyState icon={Package} heading="No kits yet">
          <p className="mb-4">
            Bundle your gear into reusable kits to quickly load them into
            packing lists.
          </p>
          <Button size="sm" className="gap-1" onClick={handleCreate}>
            <PlusIcon size={14} /> Create Kit
          </Button>
        </EmptyState>
      )}

      {total > 0 && (
        <>
          <Input
            placeholder="Search kits..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="md:w-72"
          />

          {filteredKits.length === 0 && (
            <div className="text-sm text-muted-foreground py-6 text-center">
              No kits matching "{search}"
            </div>
          )}

          <div className="flex flex-col gap-2">
            {filteredKits.map(kit => {
              const isExpanded = expandedIds.has(kit.id)
              return (
                <div
                  key={kit.id}
                  className={cn(
                    'rounded-lg border bg-card overflow-hidden transition-colors',
                    !isExpanded && 'hover:border-primary/60',
                  )}
                >
                  <div className="flex items-center gap-2 pl-3 pr-2 py-2.5">
                    <button
                      onClick={() => toggleExpand(kit.id)}
                      className="flex flex-1 min-w-0 items-center gap-2 text-left cursor-pointer"
                    >
                      <ChevronRight
                        size={16}
                        className={cn(
                          'shrink-0 text-muted-foreground transition-transform',
                          isExpanded && 'rotate-90',
                        )}
                      />
                      <span className="truncate font-semibold text-foreground">
                        {kit.name}
                      </span>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {kit.items.length}{' '}
                        {kit.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground"
                      onClick={() => setView({ mode: 'editor', kit })}
                    >
                      <Pencil size={14} />
                      <span className="sr-only">Edit kit</span>
                    </Button>
                  </div>

                  {isExpanded && kit.items.length > 0 && (
                    <div className="border-t divide-y divide-border bg-background/40">
                      {kit.items.map(ki => (
                        <div
                          key={ki.item_id}
                          className="flex items-center justify-between gap-4 px-4 py-2 pl-[2.375rem] text-sm"
                        >
                          <div className="min-w-0 truncate">
                            <span className="text-foreground">{ki.item.name}</span>
                            {(ki.item.brand?.name || ki.item.product?.name) && (
                              <span className="ml-2 text-muted-foreground">
                                {[ki.item.brand?.name, ki.item.product?.name]
                                  .filter(Boolean)
                                  .join(' ')}
                              </span>
                            )}
                          </div>
                          {ki.quantity > 1 && (
                            <span className="shrink-0 tabular-nums text-muted-foreground">
                              {ki.quantity}x
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {isExpanded && kit.items.length === 0 && (
                    <div className="border-t px-4 py-3 pl-[2.375rem] text-sm text-muted-foreground">
                      No items in this kit
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
