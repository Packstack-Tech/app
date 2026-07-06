import { FC } from 'react'
import { Droplet, Flame, Gauge, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui'

type Props = {
  onUpgrade: () => void
  compact?: boolean
}

const FEATURES = [
  {
    icon: Flame,
    title: 'Daily calorie targets',
    description:
      'Estimate the calories you burn each day using the Pandolf equation, tuned to your pack weight, terrain, and pace.',
  },
  {
    icon: Gauge,
    title: 'Personalized to your profile',
    description:
      'Results factor in your hiker profile and trip details for a realistic fuel plan.',
  },
  {
    icon: Droplet,
    title: 'Food & water planning',
    description:
      'See daily and total-trip food weight plus water needs so you pack the right amount.',
  },
]

export const CalorieUpgrade: FC<Props> = ({ onUpgrade, compact = false }) => {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-6 text-center">
        <div className="rounded-full bg-primary/10 p-2.5">
          <Flame size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Calorie estimates are a Pro feature
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Estimate daily calorie and water needs for any trip using the
            Pandolf equation, tailored to your pack weight, terrain, and pace.
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
        <Flame size={28} className="text-primary" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-foreground">
        Unlock Calorie Requirements
      </h2>
      <p className="mt-2 text-muted-foreground">
        Estimate daily calorie and water needs for any trip using the Pandolf
        equation, tailored to your pack weight, terrain, and pace. Upgrade to
        fuel your adventures.
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
