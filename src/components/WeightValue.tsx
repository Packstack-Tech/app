import { FC, ReactNode } from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { SYSTEM_UNIT } from '@/lib/consts'
import { Mixpanel } from '@/lib/mixpanel'
import { cn } from '@/lib/utils'
import {
  convertWeightValue,
  formatWeightIn,
  oppositeSystem,
  WeightFormat,
} from '@/lib/weight'
import { Unit } from '@/types/item'

type Props = {
  /** The weight, expressed in `unit`. */
  value: number
  unit: Unit
  /** The system the weight is shown in; the tooltip shows the other one. */
  system: SYSTEM_UNIT
  /** Display style, so the conversion reads at the same precision. */
  format?: WeightFormat
  /** Overrides the shown text (defaults to `value` formatted in `system`). */
  children?: ReactNode
  className?: string
}

// One event per page per load: enough to see whether (and where) people use
// the conversion without a track call on every hover.
const trackedPaths = new Set<string>()

/**
 * A weight with a dotted underline that shows its metric/imperial
 * conversion on hover.
 */
export const WeightValue: FC<Props> = ({
  value,
  unit,
  system,
  format = 'item',
  children,
  className,
}) => {
  const grams = convertWeightValue(value, unit, 'g')
  const shown = children ?? formatWeightIn(grams, system, format)

  // Nothing worth converting.
  if (!grams) return <span className={className}>{shown}</span>

  const target = oppositeSystem(system)

  const onOpenChange = (open: boolean) => {
    const path = window.location.pathname
    if (!open || trackedPaths.has(path)) return
    trackedPaths.add(path)
    Mixpanel.track('Weight:ConversionViewed', { to: target, format })
  }

  return (
    <Tooltip delayDuration={150} onOpenChange={onOpenChange}>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'underline decoration-dotted decoration-current/40 underline-offset-[3px]',
            className
          )}
        >
          {shown}
        </span>
      </TooltipTrigger>
      <TooltipContent className="tabular-nums">
        {formatWeightIn(grams, target, format)}
      </TooltipContent>
    </Tooltip>
  )
}
