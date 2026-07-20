import { FC } from 'react'
import { FlameIcon, StickyNoteIcon } from 'lucide-react'
import { Cell } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { useUser } from '@/hooks/useUser'
import { formatItemWeight, getItemDisplayUnit } from '@/lib/weight'
import { Item, ItemCondition, ItemStatus } from '@/types/item'

export const EmptyDash = () => (
  <span className="text-muted-foreground/30">—</span>
)

type Props = {
  cell: Cell<Item, unknown>
}

const STATUS_LABELS: Record<ItemStatus, string> = {
  active: 'Active',
  wishlist: 'Wishlist',
  retired: 'Retired',
  sold: 'Sold',
  lost: 'Lost',
}

const STATUS_STYLES: Record<ItemStatus, string> = {
  active: '',
  wishlist: 'bg-blue-500/15 text-blue-400',
  retired: 'bg-zinc-500/15 text-zinc-400',
  sold: 'bg-emerald-500/15 text-emerald-400',
  lost: 'bg-red-500/15 text-red-400',
}

export const NameCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  const { name, removed, status } = original
  if (!name) return <EmptyDash />

  if (removed) {
    return (
      <span className="bg-red-500/10 text-red-400 rounded px-1.5 py-0.5">
        {name}
      </span>
    )
  }

  const showBadge = status && status !== 'active'
  return (
    <div className="flex items-center gap-1.5">
      <span>{name}</span>
      {showBadge && (
        <span
          className={`text-[10px] font-medium rounded-full px-1.5 py-0.5 leading-none ${STATUS_STYLES[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      )}
    </div>
  )
}

const CONDITION_STYLES: Record<ItemCondition, string> = {
  new: 'bg-zinc-500/15 text-zinc-400',
  good: 'bg-emerald-500/15 text-emerald-400',
  fair: 'bg-yellow-500/15 text-yellow-400',
  worn: 'bg-orange-500/15 text-orange-400',
}

type ConditionCellProps = Props & {
  score?: number | null
}

function getScoreInfo(score: number) {
  if (score >= 0.7) return { dotColor: 'bg-red-500', label: 'Replace soon' }
  if (score >= 0.4) return { dotColor: 'bg-yellow-500', label: 'Moderate wear' }
  return { dotColor: 'bg-emerald-500', label: 'Good condition' }
}

export const ConditionCell: FC<ConditionCellProps> = ({
  cell: {
    row: { original },
  },
  score,
}) => {
  const { condition } = original

  if (!condition && score == null) return <EmptyDash />

  const pill = condition ? (
    <span
      className={`text-[10px] font-medium rounded-full px-2 py-0.5 leading-none capitalize ${CONDITION_STYLES[condition] || ''}`}
    >
      {condition}
    </span>
  ) : null

  if (score == null) return pill

  const pct = Math.round(score * 100)
  const { dotColor, label } = getScoreInfo(score)

  const ownedYears = original.acquired_date
    ? (
        (Date.now() - new Date(original.acquired_date).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000)
      ).toFixed(1)
    : null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-1.5 cursor-default">
          <span className={`size-2 rounded-full shrink-0 ${dotColor}`} />
          {pill}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium text-background">{label} ({pct}%)</p>
        {ownedYears && (
          <p className="text-xs text-background/70">Owned {ownedYears}y</p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

export const ViewAction: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  return (
    <Button size="sm" variant="outline" asChild>
      <Link
        to="/inventory/$itemId"
        params={{ itemId: String(original.id) }}
      >
        View
      </Link>
    </Button>
  )
}

export const WeightCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  const user = useUser()
  const { weight, unit, consumable } = original
  if (!weight) return <EmptyDash />
  const targetUnit = getItemDisplayUnit(user.unit_weight)
  return (
    <div className="inline-flex items-center gap-1">
      {consumable && <FlameIcon color="white" size={16} strokeWidth={1} />}
      <span>{formatItemWeight(weight, unit, targetUnit)}</span>
    </div>
  )
}

export const NotesCell: FC<Props> = ({
  cell: {
    row: { original },
  },
}) => {
  if (!original.notes) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <StickyNoteIcon
          color="lightblue"
          size={20}
          strokeWidth={1}
          className="hover:cursor-pointer"
        />
      </PopoverTrigger>
      <PopoverContent
        className="w-[240px] p-2 text-left text-xs"
        align="center"
      >
        <p>{original.notes}</p>
      </PopoverContent>
    </Popover>
  )
}
