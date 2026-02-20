import { FC } from 'react'
import { LucideIcon } from 'lucide-react'

interface Props {
  icon?: LucideIcon
  heading?: string
  children?: React.ReactNode
}

export const EmptyState: FC<Props> = ({ icon: Icon, heading, children }) => (
  <div className="flex flex-col items-center text-center py-12 px-6">
    {Icon && (
      <div className="mb-4 rounded-full bg-muted p-3">
        <Icon size={24} className="text-muted-foreground" />
      </div>
    )}
    {heading && (
      <h4 className="text-base font-semibold mb-1.5">{heading}</h4>
    )}
    <div className="text-sm text-muted-foreground max-w-xs">{children}</div>
  </div>
)
