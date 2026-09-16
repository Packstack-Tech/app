import { FC, useState } from 'react'
import { PencilIcon, PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui'
import { HikerProfileForm } from '@/containers/HikerProfileForm/HikerProfileForm'
import { useHikerProfileQuery } from '@/queries/hiker-profile'

type Props = {
  bare?: boolean
}

/**
 * The user's one hiker profile — body stats that feed the calorie estimate.
 * Replaced the multi-profile list in Sept 2026; there is no add, delete or
 * "default" any more, only edit (or create, for accounts that predate
 * onboarding and never made one).
 */
export const HikerProfileSection: FC<Props> = ({ bare = false }) => {
  const { profile } = useHikerProfileQuery()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <div className={bare ? '' : 'p-4 border-b border-border'}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Hiker Profile
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            {profile ? (
              <PencilIcon className="size-3.5 mr-1" />
            ) : (
              <PlusIcon className="size-3.5 mr-1" />
            )}
            {profile ? 'Edit' : 'Create'}
          </Button>
        </div>

        {profile ? (
          <p className="text-sm">
            <span className="font-medium">{profile.name}</span>
            <span className="text-muted-foreground">
              {' '}
              &middot; body stats used for calorie estimates
            </span>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Add your body stats to enable calorie estimates for your trips.
          </p>
        )}
      </div>

      <HikerProfileForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        profile={profile}
      />
    </>
  )
}
