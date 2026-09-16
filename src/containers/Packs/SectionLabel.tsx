import { FC, ReactNode } from 'react'

type Props = {
  count?: number
  children: ReactNode
}

export const SectionLabel: FC<Props> = ({ count, children }) => (
  <div className="mb-3 flex items-baseline gap-2">
    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h2>
    {count != null && (
      <span className="text-xs text-muted-foreground/70">{count}</span>
    )}
  </div>
)
