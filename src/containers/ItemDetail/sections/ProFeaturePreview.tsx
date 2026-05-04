import { FC, ReactNode } from 'react'
import { SparklesIcon } from 'lucide-react'

import { Button } from '@/components/ui'

interface Props {
  title: string
  description: string
  onUpgrade: () => void
  children?: ReactNode
}

export const ProFeaturePreview: FC<Props> = ({
  title,
  description,
  onUpgrade,
  children,
}) => {
  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
          <SparklesIcon size={12} />
          Pro
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      {children && (
        <div className="relative mb-4">
          <div className="opacity-30 pointer-events-none select-none" aria-hidden>
            {children}
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
        </div>
      )}

      <Button size="sm" variant="outline" onClick={onUpgrade} className="gap-1.5">
        <SparklesIcon size={12} />
        Upgrade to unlock
      </Button>
    </section>
  )
}
