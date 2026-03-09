import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Package, Pencil } from 'lucide-react'

import { Button, Input } from '@/components/ui'
import { KitEditor } from '@/containers/KitForm'
import { useKits } from '@/queries/kit'
import { Kit } from '@/types/kit'

type View = { mode: 'list' } | { mode: 'editor'; kit?: Kit }

export const KitsPage = () => {
  const { data: kits, isLoading } = useKits()
  const [view, setView] = useState<View>({ mode: 'list' })
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

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

  return (
    <div className="px-4 md:px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-heading">Kits</h1>
        <Button size="sm" onClick={() => setView({ mode: 'editor' })}>
          Create Kit
        </Button>
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground">Loading...</div>
      )}

      {!isLoading && (!kits || kits.length === 0) && (
        <div className="text-center py-12">
          <Package
            size={48}
            className="mx-auto text-muted-foreground/50 mb-4"
          />
          <p className="text-muted-foreground mb-1">No kits yet</p>
          <p className="text-muted-foreground text-sm mb-4">
            Bundle your gear into reusable kits to quickly load them into
            packing lists.
          </p>
          <Button
            variant="outline"
            onClick={() => setView({ mode: 'editor' })}
          >
            Create your first kit
          </Button>
        </div>
      )}

      {kits && kits.length > 0 && (
        <>
          <Input
            placeholder="Search kits..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-4 md:w-64"
          />

          {filteredKits.length === 0 && (
            <div className="text-sm text-muted-foreground py-6 text-center">
              No kits matching "{search}"
            </div>
          )}

          <div className="space-y-2">
            {filteredKits.map(kit => {
              const isExpanded = expandedIds.has(kit.id)
              return (
                <div
                  key={kit.id}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-card">
                    <button
                      onClick={() => toggleExpand(kit.id)}
                      className="flex items-center gap-2 text-left flex-1 min-w-0"
                    >
                      {isExpanded ? (
                        <ChevronDown
                          size={16}
                          className="text-muted-foreground shrink-0"
                        />
                      ) : (
                        <ChevronRight
                          size={16}
                          className="text-muted-foreground shrink-0"
                        />
                      )}
                      <span className="font-medium truncate">{kit.name}</span>
                      <span className="text-muted-foreground text-sm shrink-0">
                        {kit.items.length}{' '}
                        {kit.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setView({ mode: 'editor', kit })}
                    >
                      <Pencil size={14} />
                    </Button>
                  </div>

                  {isExpanded && kit.items.length > 0 && (
                    <div className="border-t border-border divide-y divide-border">
                      {kit.items.map(ki => (
                        <div
                          key={ki.item_id}
                          className="flex items-center justify-between px-4 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <span className="truncate">{ki.item.name}</span>
                            {(ki.item.brand?.name ||
                              ki.item.product?.name) && (
                              <span className="text-muted-foreground ml-2">
                                {ki.item.brand?.name} {ki.item.product?.name}
                              </span>
                            )}
                          </div>
                          {ki.quantity > 1 && (
                            <span className="text-muted-foreground shrink-0 tabular-nums">
                              {ki.quantity}x
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {isExpanded && kit.items.length === 0 && (
                    <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
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
