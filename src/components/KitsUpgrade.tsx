import { FC } from 'react'
import { Layers, PackageCheck, Repeat, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui'

type Props = {
  onUpgrade: () => void
  compact?: boolean
}

const FEATURES = [
  {
    icon: Layers,
    title: 'Build reusable gear bundles',
    description:
      'Group the gear you always pack together — sleep system, cook kit, first aid — into a named kit.',
  },
  {
    icon: PackageCheck,
    title: 'Load a kit into any pack instantly',
    description:
      'Add an entire gear set to a packing list in one click instead of hunting item by item.',
  },
  {
    icon: Repeat,
    title: 'Stay consistent trip after trip',
    description:
      'Reuse your dialed-in setups so you never forget the essentials on your next adventure.',
  },
]

export const KitsUpgrade: FC<Props> = ({ onUpgrade, compact = false }) => {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-6 text-center">
        <div className="rounded-full bg-primary/10 p-2.5">
          <Sparkles size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Kits are a Pro feature
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Bundle gear you pack together and load it into any list with one
            click.
          </p>
        </div>
        <Button size="sm" className="gap-1" onClick={onUpgrade}>
          <Sparkles size={14} /> Upgrade to Pro
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-12 text-center">
      <div className="rounded-full bg-primary/10 p-4">
        <Sparkles size={28} className="text-primary" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-foreground">
        Kits are a Pro feature
      </h2>
      <p className="mt-2 text-muted-foreground">
        Kits let you bundle the gear you pack together and drop a whole setup
        into any trip in a single click. Upgrade to build your own.
      </p>

      <div className="mt-8 grid w-full gap-4 text-left">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="shrink-0 rounded-md bg-primary/10 p-2">
              <Icon size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Button size="lg" className="mt-8 gap-1.5" onClick={onUpgrade}>
        <Sparkles size={16} /> Upgrade to Pro
      </Button>
    </div>
  )
}
