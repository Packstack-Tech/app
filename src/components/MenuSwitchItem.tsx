import { FC } from 'react'
import { LucideIcon } from 'lucide-react'

import { DropdownMenuItem } from '@/components/ui/DropdownMenu'

type Props = {
  icon: LucideIcon
  label: string
  checked: boolean
  onToggle: () => void
}

/** A dropdown row with an on/off switch. Toggling keeps the menu open. */
export const MenuSwitchItem: FC<Props> = ({
  icon: Icon,
  label,
  checked,
  onToggle,
}) => {
  const state = checked ? 'checked' : 'unchecked'
  return (
    <DropdownMenuItem
      onClick={e => {
        e.preventDefault()
        onToggle()
      }}
    >
      <Icon size={14} />
      {label}
      <span
        role="switch"
        aria-checked={checked}
        className="ml-auto relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-muted-foreground/40 transition-colors bg-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        data-state={state}
      >
        <span
          className="pointer-events-none block h-3.5 w-3.5 rounded-full bg-muted-foreground/40 data-[state=checked]:bg-primary-foreground shadow-sm transition-transform translate-x-0.5 data-[state=checked]:translate-x-4"
          data-state={state}
        />
      </span>
    </DropdownMenuItem>
  )
}
