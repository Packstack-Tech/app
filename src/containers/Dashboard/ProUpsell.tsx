import { FC } from 'react'
import { BarChart3, MapPin, SparklesIcon, Wrench } from 'lucide-react'

import { Button } from '@/components/ui'
import { useSubscription } from '@/hooks/useSubscription'

const FEATURES = [
  { icon: Wrench, label: 'Gear lifecycle tracking' },
  { icon: BarChart3, label: 'Replacement scoring' },
  { icon: MapPin, label: 'AI-powered trail research' },
]

export const ProUpsell: FC = () => {
  const { isSubscribed, openUpgrade } = useSubscription()

  if (isSubscribed) return null

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon size={16} className="text-primary" />
        <h3 className="text-sm font-semibold">Unlock Pro Features</h3>
      </div>

      <ul className="space-y-1.5 mb-4">
        {FEATURES.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon size={12} className="text-primary shrink-0" />
            {label}
          </li>
        ))}
      </ul>

      <Button size="sm" onClick={openUpgrade} className="w-full">
        Upgrade to Pro
      </Button>
    </div>
  )
}
