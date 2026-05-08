import { FC } from 'react'
import {
  LockIcon,
  Package,
  SparklesIcon,
  StickyNote,
  Wrench,
} from 'lucide-react'

import { Button } from '@/components/ui'

interface Props {
  onUpgrade: () => void
}

const GAUGE_SIZE = 88
const STROKE_WIDTH = 7
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SCORE = 45
const DASH_OFFSET = CIRCUMFERENCE * (1 - SCORE / 100)

const LOG_EVENTS = [
  { icon: StickyNote, label: 'Note', date: 'Sep 12, 2025', detail: 'Seam showing wear on left shoulder strap' },
  { icon: Wrench, label: 'Condition Change', date: 'Jun 3, 2025', detail: 'New \u2192 Good' },
  { icon: Package, label: 'Acquired', date: 'Jan 15, 2025', detail: 'Purchased new' },
]

export const GearHealthPreview: FC<Props> = ({ onUpgrade }) => {
  return (
    <section className="rounded-xl border border-primary/20 bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <h2 className="text-base font-semibold text-foreground">
          Gear Lifecycle Tracking
        </h2>
        <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium bg-primary/10 rounded-full px-2 py-0.5 leading-none">
          <SparklesIcon size={10} />
          Pro
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        Track status, optimize replacement timelines, and maintain a detailed
        history log&mdash;all in one unified view.
      </p>

      {/* Locked preview area */}
      <div className="relative rounded-lg border border-border bg-muted/20 overflow-hidden">
        <div className="opacity-40 pointer-events-none select-none p-4 space-y-4" aria-hidden>
          {/* Top row: gauge + data summary */}
          <div className="flex gap-5 items-start">
            {/* Circular health score */}
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
                  className="stroke-yellow-500"
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={DASH_OFFSET}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-muted-foreground leading-none">Status</span>
                <span className="text-lg font-bold leading-tight">{SCORE}%</span>
              </div>
            </div>

            {/* Data summary */}
            <div className="flex-1 space-y-3 pt-1">
              <div>
                <p className="text-xs text-muted-foreground">Current Condition</p>
                <p className="text-sm font-semibold text-foreground">Good</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expected Lifetime</p>
                <p className="text-sm font-semibold text-foreground">5 years</p>
              </div>
            </div>
          </div>

          {/* Activity log snippet */}
          <div>
            <p className="text-xs font-semibold mb-2 text-foreground">Recent Activity</p>
            <div className="space-y-0">
              {LOG_EVENTS.map(({ icon: Icon, label, date, detail }, i) => (
                <div key={label} className="flex gap-2.5 pb-3">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center size-6 rounded-full bg-muted shrink-0">
                      <Icon size={12} className="text-muted-foreground" />
                    </div>
                    {i < LOG_EVENTS.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium">{label}</span>
                      <span className="text-[10px] text-muted-foreground">{date}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center justify-center size-10 rounded-full bg-background/80 border border-border shadow-sm">
            <LockIcon size={18} className="text-muted-foreground" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-card to-transparent" />
      </div>

      {/* CTA */}
      <div className="flex justify-center pt-1">
        <Button type="button" onClick={onUpgrade} className="gap-2 px-6">
          <SparklesIcon size={14} />
          Upgrade to Pro
        </Button>
      </div>
    </section>
  )
}
