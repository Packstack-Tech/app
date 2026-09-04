import { FC } from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'

type Props = {
  /** Titles of the other packs holding this item. Renders nothing when empty. */
  packNames?: string[]
}

/**
 * "Already in another pack" marker.
 *
 * Deliberately neutral rather than cautionary: packs are used both as people
 * (where an overlap may be an accidental double-carry) and as loadout variants
 * of one person (where an overlap is entirely normal), and the app can't tell
 * those apart. A grey pill states the fact and lets the user judge.
 */
export const PackMembershipBadge: FC<Props> = ({ packNames }) => {
  if (!packNames?.length) return null

  const label =
    packNames.length === 1
      ? packNames[0]
      : `${packNames[0]} +${packNames.length - 1}`

  const badge = (
    <span className="inline-flex max-w-[120px] items-center truncate rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
      {label}
    </span>
  )

  if (packNames.length === 1) return badge

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="bottom">
        Also in {packNames.join(', ')}
      </TooltipContent>
    </Tooltip>
  )
}
