import { FC } from 'react'
import { SparklesIcon } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { useSubscription } from '@/hooks/useSubscription'

interface Props {
  title?: string
  description?: string
  compact?: boolean
}

export const UpgradePrompt: FC<Props> = ({
  title = 'Full Access Required',
  description = 'Upgrade to unlock this feature and get the most out of Packstack.',
  compact = false,
}) => {
  const { openUpgrade } = useSubscription()

  if (compact) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <SparklesIcon size={14} className="text-primary shrink-0" />
            <p className="text-xs text-muted-foreground truncate">{title}</p>
          </div>
          <Button size="xs" onClick={openUpgrade}>
            Upgrade
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-8 px-4">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center max-w-sm w-full space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <SparklesIcon size={20} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button onClick={openUpgrade}>
          Upgrade Now
        </Button>
      </div>
    </div>
  )
}
