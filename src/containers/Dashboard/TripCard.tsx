import { FC, useCallback, useState } from 'react'
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
import { useCloneTrip, useDeleteTrip } from '@/queries/trip'
import { Trip } from '@/types/trip'

const DATE_FORMAT = 'MMM d, yyyy'

type Props = {
  trip: Trip
  showCountdown?: boolean
}

export const TripCard: FC<Props> = ({ trip, showCountdown }) => {
  const navigate = useNavigate()
  const deleteTrip = useDeleteTrip()
  const cloneTrip = useCloneTrip()
  const units = useUnits()
  const { canCreateTrip, openUpgrade } = useTripLimit()

  const { created_at, start_date, end_date, id, location, removed, enrich_status } = trip

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

  return (
    <div className="group px-5 py-4 transition-colors hover:bg-muted/30">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              to="/pack/$id"
              params={{ id: `${id}` }}
              className="text-base font-semibold text-foreground hover:text-primary transition-colors"
            >
              {location || 'Untitled'}
            </Link>
            {enrich_status === 'processing' && (
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            )}
            {enrich_status === 'failed' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <RotateCw size={13} className="text-amber-500" />
                </TooltipTrigger>
                <TooltipContent>Enrichment failed</TooltipContent>
              </Tooltip>
            )}
          </div>

          {start && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar size={13} className="shrink-0" />
              <span>{dayTrip ? start : `${start} - ${end}`}</span>
              {countdown && (
                <span className="text-xs text-primary font-medium ml-1">
                  ({countdown})
                </span>
              )}
            </div>
          )}

          {badges.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
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

          {trip.notes && <NotesField text={trip.notes} />}
        </div>

        {!removed && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <button className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
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
                  This will create a copy of {location || 'Untitled'}.
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
                    <button className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
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
                  This will permanently delete {location || 'Untitled'}.
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

      <p className="mt-2 text-xs text-muted-foreground">Created {created}</p>
    </div>
  )
}

function NotesField({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)

  const measuredRef = useCallback((node: HTMLParagraphElement | null) => {
    if (node) {
      setClamped(node.scrollHeight > node.clientHeight)
    }
  }, [])

  return (
    <div className="mt-2">
      <p
        ref={measuredRef}
        className={`text-xs text-muted-foreground ${expanded ? '' : 'line-clamp-2'}`}
      >
        {text}
      </p>
      {(clamped || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="text-xs text-primary hover:underline mt-0.5"
        >
          {expanded ? 'read less...' : 'read more...'}
        </button>
      )}
    </div>
  )
}
