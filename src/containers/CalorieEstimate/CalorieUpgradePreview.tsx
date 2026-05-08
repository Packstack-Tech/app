import { FC } from 'react'
import {
  DropletIcon,
  FlameIcon,
  LockIcon,
  SparklesIcon,
} from 'lucide-react'

import { Button } from '@/components/ui'

interface Props {
  onUpgrade: () => void
}

export const CalorieUpgradePreview: FC<Props> = ({ onUpgrade }) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-sm font-semibold inline-flex items-center gap-1.5">
          <FlameIcon size={14} className="text-orange-400" />
          Calorie Calculator
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] text-primary font-medium bg-primary/10 rounded-full px-1.5 py-0.5 leading-none">
          <SparklesIcon size={8} />
          Pro
        </span>
      </div>

      <div className="text-sm rounded-lg border border-border bg-muted/30 overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-muted/50">
          <p className="text-xs text-muted-foreground">
            Estimate daily calorie needs, macro targets, and food weight for
            your trip.
          </p>
        </div>

        {/* Locked preview */}
        <div className="relative">
          <div className="opacity-40 pointer-events-none select-none px-3 py-2 space-y-0.5" aria-hidden>
            <div className="flex justify-between py-0.5 border-b border-border pb-1">
              <p className="font-semibold text-orange-400 inline-flex items-center gap-1">
                <FlameIcon size={13} />
                Daily
              </p>
              <p className="font-semibold text-orange-400">3,200 kcal</p>
            </div>

            <div className="flex justify-between py-0.5">
              <p className="text-muted-foreground">Food / day</p>
              <p>1.8 lb</p>
            </div>

            <div className="grid grid-cols-3 gap-1 py-1">
              <div className="bg-muted/50 rounded px-1.5 py-1 text-center">
                <p className="text-[10px] text-muted-foreground">Carbs</p>
                <p className="text-xs font-medium">420g</p>
              </div>
              <div className="bg-muted/50 rounded px-1.5 py-1 text-center">
                <p className="text-[10px] text-muted-foreground">Fat</p>
                <p className="text-xs font-medium">120g</p>
              </div>
              <div className="bg-muted/50 rounded px-1.5 py-1 text-center">
                <p className="text-[10px] text-muted-foreground">Protein</p>
                <p className="text-xs font-medium">100g</p>
              </div>
            </div>

            <div className="flex justify-between py-0.5">
              <p className="text-muted-foreground inline-flex items-center gap-1">
                <DropletIcon size={11} />
                Water
              </p>
              <p>3.2 L/day</p>
            </div>
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center justify-center size-8 rounded-full bg-background/80 border border-border shadow-sm">
              <LockIcon size={14} className="text-muted-foreground" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-muted/30 to-transparent" />
        </div>

        {/* CTA */}
        <div className="px-3 py-2.5 border-t border-border flex justify-center">
          <Button type="button" size="sm" onClick={onUpgrade} className="gap-1.5 w-full">
            <SparklesIcon size={12} />
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </div>
  )
}
