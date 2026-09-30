import { FC } from 'react'

import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { useUser } from '@/hooks/useUser'
import { Mixpanel } from '@/lib/mixpanel'
import { overpackSettings } from '@/lib/overpack'
import { useUpdateUser } from '@/queries/user'
import { OverpackMode } from '@/types/user'

const MODES: { value: OverpackMode; label: string; help: string }[] = [
  { value: 'off', label: 'Off', help: 'Never check.' },
  {
    value: 'warn',
    label: 'Warn',
    help: 'Flag items packed across a trip in greater quantity than you own.',
  },
  {
    value: 'block',
    label: 'Block',
    help: "Don't let a trip pack more of an item than you own.",
  },
]

/**
 * Over-pack check settings. Saved on change — they're two controls, and a
 * separate Save button here would compete with the account form's.
 */
export const OverpackSettings: FC = () => {
  const user = useUser()
  const updateUser = useUpdateUser()
  const settings = overpackSettings(user)

  const save = (next: Partial<{ overpack_mode: OverpackMode; overpack_include_consumables: boolean }>) => {
    updateUser.mutate(next, {
      onSuccess: () => {
        Mixpanel.track('Overpack:SettingsChanged', {
          mode: next.overpack_mode ?? settings.mode,
          include_consumables:
            next.overpack_include_consumables ?? settings.includeConsumables,
        })
      },
    })
  }

  const current = MODES.find(m => m.value === settings.mode) ?? MODES[1]

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Over-packing
      </h3>
      <p className="text-sm text-muted-foreground">
        Each item in your gear closet has an owned quantity. Packstack can check
        whether a trip packs more of an item than you own, across all of its packs.
      </p>

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="overpack-mode" className="text-sm">
            When a trip packs more than I own
          </Label>
          <p className="text-xs text-muted-foreground">{current.help}</p>
        </div>
        <Select
          value={settings.mode}
          onValueChange={v => save({ overpack_mode: v as OverpackMode })}
          disabled={updateUser.isPending}
        >
          <SelectTrigger id="overpack-mode" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODES.map(m => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="overpack-consumables" className="text-sm">
            Include consumables
          </Label>
          <p className="text-xs text-muted-foreground">
            Turn off if you don't track how much food and fuel you keep on hand.
          </p>
        </div>
        <Switch
          id="overpack-consumables"
          checked={settings.includeConsumables}
          onCheckedChange={v => save({ overpack_include_consumables: v })}
          disabled={updateUser.isPending || settings.mode === 'off'}
        />
      </div>
    </section>
  )
}
