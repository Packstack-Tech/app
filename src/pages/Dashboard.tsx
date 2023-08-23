import { FC } from "react"
import { format } from "date-fns"
import { Link } from "react-router-dom"
import { useUserQuery } from "@/queries/user"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogDestructiveAction,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog"
import { CopyPlus, Trash2Icon } from "lucide-react"
import { useDeleteTrip } from "@/queries/trip"

const DATE_FORMAT = "MMM dd, yyyy"

export const Dashboard: FC = () => {
  const { data } = useUserQuery()
  const deleteTrip = useDeleteTrip()

  const onDelete = (id: number) => {
    deleteTrip.mutate(id)
  }

  const onClone = (id: number) => {
    console.log("clone", id)
  }

  return (
    <div className="max-w-lg mx-auto my-8">
      <h2 className="mb-2">Packing Lists</h2>
      {(data?.trips || []).map(
        ({ created_at, start_date, end_date, id, title }) => {
          const created = format(new Date(created_at), DATE_FORMAT)
          const start = start_date
            ? format(new Date(start_date), DATE_FORMAT)
            : "-"
          const end = end_date ? format(new Date(end_date), DATE_FORMAT) : "-"

          const dayTrip = start === end

          return (
            <div key={id} className="p-4 rounded-sm border mb-2">
              <Link to={`/pack/${id}`} className="text-primary hover:underline">
                {title || "untitled"}
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
                        This will create a copy of {title || "untitled"}.
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
                        This will permanently delete {title || "untitled"}.
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