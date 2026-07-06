import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { HikerProfileFields } from '@/containers/HikerProfileForm/HikerProfileFields'
import type { HikerProfile } from '@/types/hiker-profile'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile?: HikerProfile | null
  isFirstProfile?: boolean
}

export const HikerProfileForm = ({
  open,
  onOpenChange,
  profile,
  isFirstProfile = false,
}: Props) => {
  const isEditing = !!profile

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Hiker Profile' : 'New Hiker Profile'}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          {/* key forces a fresh form state each time the dialog opens for a
              different profile (or for create vs. edit). */}
          <HikerProfileFields
            key={profile?.id ?? 'new'}
            profile={profile}
            isFirstProfile={isFirstProfile}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
