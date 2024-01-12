import { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { CopyPlus, PlusIcon, Trash2Icon } from 'lucide-react'

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
import { useCloneTrip, useDeleteTrip } from '@/queries/trip'
import { Trip } from '@/types/trip'

import { DonationMessage } from '../DonationMessage'

const DATE_FORMAT = 'MMM dd, yyyy'

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
        navigate(`/pack/${data.id}`)
      },
    })

  return (
    <div>
      <DonationMessage />
      <div className="mb-2 flex justify-between items-center">
        <h2>Packing Lists</h2>
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => navigate('/pack/new')}
        >
          <PlusIcon size={12} /> <span>Create Pack</span>
        </Button>
      </div>

      {!trips.length && (
        <EmptyState
          subheading="Packing lists"
          heading="Create your first packing list"
        >
          <p>
            Packing lists are easy to use but extremely customizable. We want to
            offer a world-class experience that gives you confidence in your
            upcoming trip.
          </p>
          <div className="flex justify-between items-center mt-3">
            <Button variant="outline" onClick={() => navigate('/inventory')}>
              Manage Inventory
            </Button>
            <Button className="gap-1" onClick={() => navigate('/pack/new')}>
              <PlusIcon size={16} /> <span>Create Pack</span>
            </Button>
          </div>
        </EmptyState>
      )}

      {(trips || []).map(
        ({ created_at, start_date, end_date, id, location }) => {
          const created = format(new Date(created_at), DATE_FORMAT)
          const start = start_date
            ? format(new Date(start_date), DATE_FORMAT)
            : '-'
          const end = end_date ? format(new Date(end_date), DATE_FORMAT) : '-'

          const dayTrip = start === end

          return (
            <div key={id} className="p-4 rounded-sm border mb-2">
              <Link to={`/pack/${id}`} className="text-primary hover:underline">
                {location || 'untitled'}
              </Link>
              <p className="text-sm">{dayTrip ? start : `${start} - ${end}`}</p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">Created {created}</p>
                <div className="flex gap-3 items-center">
                  <AlertDialog>
                    <AlertDialogTrigger className="text-slate-300 hover:text-primary">
                      <CopyPlus size={16} />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clone packing list</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogDescription>
                        This will create a copy of {location || 'untitled'}.
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
                    <AlertDialogTrigger className="text-slate-300 hover:text-primary">
                      <Trash2Icon size={16} />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogDescription>
                        This will permanently delete {location || 'untitled'}.
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
              </div>
            </div>
          )
        }
      )}
    </div>
  )
}
