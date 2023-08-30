import { FC } from "react"
import { useNavigate } from "react-router-dom"
import { useDeletePack, useGeneratePack } from "@/queries/pack"
import { Pack } from "@/types/pack"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDestructiveAction,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog"
import { Button } from "@/components/ui"
import { Trash2Icon } from "lucide-react"

type Props = {
  packs: Pack[]
}

export const LegacyPacks: FC<Props> = ({ packs }) => {
  const generatePack = useGeneratePack()
  const deletePack = useDeletePack()
  const navigate = useNavigate()

  const onCovert = (id: number) => {
    generatePack.mutate(id, {
      onSuccess: (data) => {
        navigate(`/pack/${data.id}`)
      },
    })
  }

  if (packs.length === 0) return null

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h2>Legacy Packs</h2>
        <p className="text-sm">
          These packs need to be converted to the new format.
        </p>
      </div>
      {packs.map((rec) => (
        <div key={rec.id} className="p-4 rounded-sm border mb-2">
          <div className="flex justify-between items-center">
            <p className="text-sm">{rec.title}</p>
            <div className="flex items-center gap-3">
              <AlertDialog>
                <AlertDialogTrigger className="text-slate-300 hover:text-primary">
                  <Trash2Icon size={16} />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogDescription>
                    This will permanently delete {rec.title}.
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogDestructiveAction
                      onClick={() => deletePack.mutate(rec.id)}
                    >
                      Delete
                    </AlertDialogDestructiveAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCovert(rec.id)}
              >
                Convert
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
