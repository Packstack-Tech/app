import { FC, useState } from 'react'
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'

import { Button } from '@/components/ui'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogDestructiveAction,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { HikerProfileForm } from '@/containers/HikerProfileForm/HikerProfileForm'
import {
  useDeleteHikerProfile,
  useHikerProfilesQuery,
} from '@/queries/hiker-profile'
import type { HikerProfile } from '@/types/hiker-profile'

type Props = {
  bare?: boolean
}

export const HikerProfiles: FC<Props> = ({ bare = false }) => {
  const { data: hikerProfiles = [] } = useHikerProfilesQuery()
  const deleteProfile = useDeleteHikerProfile()

  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<HikerProfile | null>(null)
  const [deletingProfile, setDeletingProfile] = useState<HikerProfile | null>(null)

  const openCreateDialog = () => {
    setEditingProfile(null)
    setProfileDialogOpen(true)
  }

  const openEditDialog = (profile: HikerProfile) => {
    setEditingProfile(profile)
    setProfileDialogOpen(true)
  }

  const handleDeleteProfile = () => {
    if (deletingProfile) {
      deleteProfile.mutate(deletingProfile.id, {
        onSuccess: () => setDeletingProfile(null),
      })
    }
  }

  return (
    <>
      <div className={bare ? '' : 'p-4 border-b border-border'}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Hiker Profiles
          </h3>
          <Button variant="outline" size="sm" onClick={openCreateDialog}>
            <PlusIcon className="size-3.5 mr-1" />
            Add
          </Button>
        </div>

        {hikerProfiles.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Add a hiker profile to enable calorie and fitness calculations for
            your trips.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {hikerProfiles.map(profile => (
              <div
                key={profile.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium truncate">{profile.name}</span>
                  {profile.is_default && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary shrink-0">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(profile)}
                  >
                    <PencilIcon className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingProfile(profile)}
                  >
                    <TrashIcon className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <HikerProfileForm
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        profile={editingProfile}
        isFirstProfile={hikerProfiles.length === 0 && !editingProfile}
      />

      <AlertDialog
        open={!!deletingProfile}
        onOpenChange={open => !open && setDeletingProfile(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hiker Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deletingProfile?.name}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogDestructiveAction onClick={handleDeleteProfile}>
              Delete
            </AlertDialogDestructiveAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
