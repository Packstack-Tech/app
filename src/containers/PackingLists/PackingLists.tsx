import { FC } from 'react'
import { format } from 'date-fns'
import { Calendar, CopyPlus, Map, PlusIcon, Trash2Icon } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'

import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui'
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
import { useCloneTrip, useDeleteTrip } from '@/queries/trip'
import { Trip } from '@/types/trip'

const DATE_FORMAT = 'MMM d, yyyy'

type Props = {
  trips: Trip[]
}

export const PackingLists: FC<Props> = ({ trips }) => {
  const navigate = useNavigate()
  const deleteTrip = useDeleteTrip()
  const cloneTrip = useCloneTrip()

  const onDelete = (id: number) => deleteTrip.mutate(id)

  const onClone = (id: number) =>
    cloneTrip.mutate(id, {
      onSuccess: data => {
        navigate({ to: '/pack/$id', params: { id: `${data.id}` } })
      },
    })

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-lg font-semibold">Packing Lists</div>
          {trips.length > 0 && (
            <div className="text-sm mt-1">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => navigate({ to: '/pack/new' })}
        >
          <PlusIcon size={14} /> Create Pack
        </Button>
      </div>

      {!trips.length && (
        <EmptyState icon={Map} heading="No packing lists yet">
          <p className="mb-4">
            Create a pack to organize your gear with detailed weight breakdowns.
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate({ to: '/inventory' })}
            >
              Manage Inventory
            </Button>
            <Button
              size="sm"
              className="gap-1"
              onClick={() => navigate({ to: '/pack/new' })}
            >
              <PlusIcon size={14} /> Create Pack
            </Button>
          </div>
        </EmptyState>
      )}

      <div className="flex flex-col gap-3">
        {(trips || []).map(
          ({ created_at, start_date, end_date, id, location, removed }) => {
            const created = format(new Date(created_at), DATE_FORMAT)
            const start = start_date
              ? format(new Date(start_date), DATE_FORMAT)
              : null
            const end = end_date
              ? format(new Date(end_date), DATE_FORMAT)
              : null
            const dayTrip = start === end

            return (
              <div
                key={id}
                className="group rounded-md border bg-surface p-5 transition-colors hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/pack/$id"
                      params={{ id: `${id}` }}
                      className="text-base font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {location || 'Untitled'}
                    </Link>

                    {start && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar size={13} className="shrink-0" />
                        <span>{dayTrip ? start : `${start} - ${end}`}</span>
                      </div>
                    )}
                  </div>

                  {!removed && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <AlertDialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                              <button className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                                <CopyPlus size={15} />
                              </button>
                            </AlertDialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Duplicate</TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Clone packing list
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogDescription>
                            This will create a copy of{' '}
                            {location || 'Untitled'}.
                          </AlertDialogDescription>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onClone(id)}>
                              Clone
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                              <button className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
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
                            This will permanently delete{' '}
                            {location || 'Untitled'}.
                          </AlertDialogDescription>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogDestructiveAction
                              onClick={() => onDelete(id)}
                            >
                              Delete
                            </AlertDialogDestructiveAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Created {created}
                </p>
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}
