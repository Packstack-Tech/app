import { FC } from 'react'
import { format, formatDistanceToNowStrict } from 'date-fns'
import { Calendar, CopyPlus, Loader2, RotateCw, Trash2Icon } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogDestructiveAction,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/AlertDialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { useTripLimit } from '@/hooks/useTripLimit'
import { useUnits } from '@/hooks/useUnits'
import { labelFor, TERRAIN_OPTIONS } from '@/lib/tripDetails'
import { cn } from '@/lib/utils'
import { useCloneTrip, useDeleteTrip } from '@/queries/trip'
import { Trip } from '@/types/trip'

const DATE_FORMAT = 'MMM d, yyyy'

type Props = {
  trip: Trip
  showCountdown?: boolean
  /** Upcoming trips get a primary-tinted border so they read as "next up". */
  highlight?: boolean
}

export const PackCard: FC<Props> = ({ trip, showCountdown, highlight }) => {
  const navigate = useNavigate()
  const deleteTrip = useDeleteTrip()
  const cloneTrip = useCloneTrip()
  const units = useUnits()
  const { canCreateTrip, openUpgrade } = useTripLimit()

  const { created_at, start_date, end_date, id, title, location, removed, enrich_status } = trip

  const created = format(new Date(created_at), DATE_FORMAT)
  const start = start_date ? format(new Date(start_date), DATE_FORMAT) : null
  const end = end_date ? format(new Date(end_date), DATE_FORMAT) : null
  const dayTrip = start === end

  const countdown =
    showCountdown && start_date
      ? formatDistanceToNowStrict(new Date(start_date), { addSuffix: true })
      : null

  const onDelete = () => deleteTrip.mutate(id)
  const onClone = () => {
    if (!canCreateTrip) {
      openUpgrade()
      return
    }
    cloneTrip.mutate(id, {
      onSuccess: data => {
        navigate({ to: '/pack/$id', params: { id: `${data.id}` } })
      },
    })
  }

  const badges: { label: string }[] = []

  if (trip.distance) {
    const d = Math.round(units.formatDistance(trip.distance) * 100) / 100
    badges.push({ label: `${d} ${units.distanceLabel}` })
  }
  if (trip.daily_elevation_gain) {
    const e = Math.round(units.formatElevation(trip.daily_elevation_gain))
    badges.push({ label: `${e} ${units.elevationLabel}/day` })
  }
  if (trip.temp_min != null || trip.temp_max != null) {
    const fmt = (v: number) => Math.round(units.formatTemperature(v))
    const min = trip.temp_min != null ? fmt(trip.temp_min) : '—'
    const max = trip.temp_max != null ? fmt(trip.temp_max) : '—'
    badges.push({ label: `${min}–${max}${units.temperatureLabel}` })
  }
  if (trip.terrain) {
    const label = labelFor(trip.terrain, TERRAIN_OPTIONS)
    if (label) badges.push({ label })
  }
  if (trip.pace) {
    const label = labelFor(trip.pace, units.paceOptions)
    if (label) badges.push({ label })
  }

  const name = title || location || 'Untitled'

  return (
    <div className="group relative">
      <Link
        to="/pack/$id"
        params={{ id: `${id}` }}
        className={cn(
          'flex h-full flex-col gap-2 rounded-lg border bg-card p-4 transition-colors',
          'hover:border-primary/60 hover:bg-accent/40',
          highlight && 'border-primary/40',
        )}
      >
        <div className="flex items-center gap-2 pr-14">
          <span className="truncate text-base font-semibold text-foreground">
            {name}
          </span>
          {enrich_status === 'processing' && (
            <Loader2 size={14} className="shrink-0 animate-spin text-muted-foreground" />
          )}
          {enrich_status === 'failed' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <RotateCw size={13} className="shrink-0 text-warning" />
              </TooltipTrigger>
              <TooltipContent>Enrichment failed</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar size={13} className="shrink-0" />
          {start ? (
            <span>{dayTrip ? start : `${start} - ${end}`}</span>
          ) : (
            <span>No dates</span>
          )}
          {countdown && (
            <span className="ml-1 text-xs font-medium text-primary">{countdown}</span>
          )}
        </div>

        {badges.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {badges.map(({ label }) => (
              <span
                key={label}
                className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <p className="mt-auto pt-1 text-xs text-muted-foreground/70">Created {created}</p>
      </Link>

      {!removed && (
        <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <button className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                    <CopyPlus size={15} />
                  </button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Duplicate</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clone packing list</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>
                This will create a copy of {name}.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClone}>Clone</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <button className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                    <Trash2Icon size={15} />
                  </button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>
                This will permanently delete {name}.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogDestructiveAction onClick={onDelete}>
                  Delete
                </AlertDialogDestructiveAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  )
}
