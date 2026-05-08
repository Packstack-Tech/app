import { FC, useState } from 'react'
import {
  CheckCircle2,
  CircleDot,
  PackageOpen,
  User,
  X,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui'
import { useUser } from '@/hooks/useUser'
import { useHikerProfilesQuery } from '@/queries/hiker-profile'
import { useInventory } from '@/queries/item'

const DISMISSED_KEY = 'packstack:setup-dismissed'

type ChecklistItem = {
  id: string
  label: string
  complete: boolean
  icon: FC<{ size?: number; className?: string }>
  href: string
  cta: string
}

export const SetupChecklist: FC = () => {
  const user = useUser()
  const { data: profiles, isLoading: profilesLoading } =
    useHikerProfilesQuery()
  const { data: inventory, isLoading: inventoryLoading } = useInventory()

  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === 'true'
  )

  if (dismissed || profilesLoading || inventoryLoading) return null

  const items: ChecklistItem[] = [
    {
      id: 'profile',
      label: 'Create a hiker profile',
      complete: (profiles?.length ?? 0) > 0,
      icon: User,
      href: '/settings',
      cta: 'Add Profile',
    },
    {
      id: 'inventory',
      label: 'Add gear to your closet',
      complete: (inventory?.filter(i => !i.removed).length ?? 0) > 0,
      icon: PackageOpen,
      href: '/inventory',
      cta: 'Add Gear',
    },
    {
      id: 'pack',
      label: 'Create your first pack',
      complete: (user.trips?.length ?? 0) > 0,
      icon: CircleDot,
      href: '/',
      cta: 'Create Pack',
    },
  ]

  const incomplete = items.filter(i => !i.complete)
  if (incomplete.length === 0) return null

  const completedCount = items.length - incomplete.length

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Get Started
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {completedCount}/{items.length} complete
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {items.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              {item.complete ? (
                <CheckCircle2
                  size={14}
                  className="shrink-0 text-green-500"
                />
              ) : (
                <item.icon
                  size={14}
                  className="shrink-0 text-muted-foreground"
                />
              )}
              <span
                className={`text-xs ${item.complete ? 'text-muted-foreground line-through' : 'text-foreground'}`}
              >
                {item.label}
              </span>
            </div>
            {!item.complete && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px]" asChild>
                <Link to={item.href}>{item.cta}</Link>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
