import { FC } from 'react'
import { TriangleAlert } from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { OverpackStatus } from '@/lib/overpack'

type Props = {
  status?: OverpackStatus | null
  /** Compact variant for dense rows: icon + counts only. */
  compact?: boolean
}

/**
 * "Packed more than you own" marker. Unlike PackMembershipBadge this one IS
 * cautionary: the user told us how many they own, so exceeding it is a fact
 * about the trip, not a guess about intent.
 */
export const OverpackBadge: FC<Props> = ({ status, compact }) => {
  if (!status?.over) return null

  const packed = Number.isInteger(status.packed) ? status.packed : status.packed.toFixed(2)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium leading-none text-amber-700 dark:text-amber-400">
          <TriangleAlert size={10} />
          {compact ? `${packed}/${status.owned}` : `Packed ${packed} · Own ${status.owned}`}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-60">
        This trip packs {packed} across its packs but your gear closet says you own{' '}
        {status.owned}. Edit the item to change how many you own.
      </TooltipContent>
    </Tooltip>
  )
}
