import { FC, useState } from 'react'

import { Button } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { HikerProfile } from '@/types/hiker-profile'

interface Props {
  open: boolean
  profiles: HikerProfile[] | undefined
  onClose: () => void
  onSave: (title: string, hikerProfileId?: number) => void
}

const NO_PROFILE = '__none__'

export const NewPackDialog: FC<Props> = ({ open, profiles, onClose, onSave }) => {
  const [title, setTitle] = useState('')
  const defaultProfile = profiles?.find(p => p.is_default) ?? profiles?.[0]
  const [profileId, setProfileId] = useState<string>(
    defaultProfile ? String(defaultProfile.id) : NO_PROFILE,
  )

  const hasProfiles = profiles && profiles.length > 0

  const reset = () => {
    setTitle('')
    setProfileId(defaultProfile ? String(defaultProfile.id) : NO_PROFILE)
  }

  const handleSave = () => {
    const name = title.trim()
    if (!name) return
    const selectedProfileId = profileId !== NO_PROFILE ? Number(profileId) : undefined
    onSave(name, selectedProfileId)
    reset()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) {
          reset()
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Pack</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 space-y-4">
          <div className="grid gap-1">
            <Label htmlFor="pack-title">Pack Name</Label>
            <Input
              id="pack-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Main Pack"
              autoFocus
            />
          </div>

          {hasProfiles && (
            <div className="grid gap-1">
              <Label htmlFor="pack-profile">Hiker Profile</Label>
              <Select value={profileId} onValueChange={setProfileId}>
                <SelectTrigger id="pack-profile" className="w-full">
                  <SelectValue placeholder="Select profile..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PROFILE}>None</SelectItem>
                  {profiles.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            onClick={() => {
              reset()
              onClose()
            }}
            variant="outline"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
