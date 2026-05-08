import { FC } from 'react'
import {
  BarChart3,
  FlameIcon,
  LockIcon,
  MapPin,
  Package,
  SparklesIcon,
  StickyNote,
  Wrench,
} from 'lucide-react'

import { Button } from '@/components/ui'
import { useSubscription } from '@/hooks/useSubscription'

const FEATURES = [
  { icon: Wrench, label: 'Gear lifecycle tracking' },
  { icon: BarChart3, label: 'Replacement scoring' },
  { icon: MapPin, label: 'AI-powered trail research' },
  { icon: FlameIcon, label: 'Calorie calculator' },
]

const GAUGE_SIZE = 64
const STROKE_WIDTH = 5
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SCORE = 72
const DASH_OFFSET = CIRCUMFERENCE * (1 - SCORE / 100)

const FAKE_LOG = [
  { icon: StickyNote, label: 'Note', detail: 'Zipper pull needs replacing' },
  { icon: Wrench, label: 'Condition', detail: 'Good → Fair' },
  { icon: Package, label: 'Acquired', detail: 'Purchased new' },
]

export const ProUpsell: FC = () => {
  const { isSubscribed, openUpgrade } = useSubscription()

  if (isSubscribed) return null

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon size={14} className="text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Unlock Pro
        </h3>
      </div>

      <ul className="space-y-1.5 mb-3">
        {FEATURES.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon size={12} className="text-primary shrink-0" />
            {label}
          </li>
        ))}
      </ul>

      <div className="relative rounded-md border border-border bg-muted/20 overflow-hidden">
        <div className="opacity-40 pointer-events-none select-none p-3 space-y-3" aria-hidden>
          <div className="flex gap-3 items-start">
            <div className="shrink-0 relative" style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}>
              <svg
                width={GAUGE_SIZE}
                height={GAUGE_SIZE}
                viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}
                className="-rotate-90"
              >
                <circle
                  cx={GAUGE_SIZE / 2}
                  cy={GAUGE_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  className="stroke-muted"
                  strokeWidth={STROKE_WIDTH}
                />
                <circle
                  cx={GAUGE_SIZE / 2}
                  cy={GAUGE_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  className="stroke-green-500"
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={DASH_OFFSET}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[8px] text-muted-foreground leading-none">Health</span>
                <span className="text-sm font-bold leading-tight">{SCORE}%</span>
              </div>
            </div>

            <div className="flex-1 space-y-2 pt-0.5">
              <div>
                <p className="text-[10px] text-muted-foreground">Condition</p>
                <p className="text-xs font-semibold">Good</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Lifetime</p>
                <p className="text-xs font-semibold">4 years</p>
              </div>
            </div>
          </div>

          <div className="space-y-0">
            {FAKE_LOG.map(({ icon: Icon, label, detail }, i) => (
              <div key={label} className="flex gap-2 pb-2">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center size-5 rounded-full bg-muted shrink-0">
                    <Icon size={10} className="text-muted-foreground" />
                  </div>
                  {i < FAKE_LOG.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-0.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-medium">{label}</span>
                  <p className="text-[10px] text-muted-foreground truncate">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center justify-center size-8 rounded-full bg-background/80 border border-border shadow-sm">
            <LockIcon size={14} className="text-muted-foreground" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-card to-transparent" />
      </div>

      <Button size="sm" onClick={openUpgrade} className="w-full mt-3 gap-1.5">
        <SparklesIcon size={12} />
        Upgrade to Pro
      </Button>
    </div>
  )
}
