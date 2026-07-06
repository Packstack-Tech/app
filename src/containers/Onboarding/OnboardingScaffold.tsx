import { FC, ReactNode } from 'react'

import logo from '/packstack_logo_white.png'
import { Box } from '@/components/ui'
import { cn } from '@/lib/utils'

type Props = {
  step: number
  totalSteps?: number
  title: string
  description?: string
  children: ReactNode
}

export const OnboardingScaffold: FC<Props> = ({
  step,
  totalSteps = 3,
  title,
  description,
  children,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img
            src={logo}
            alt="Packstack"
            className="w-36 invert dark:invert-0"
          />
        </div>

        <Box className="px-8 py-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === step
                    ? 'w-6 bg-primary'
                    : i < step
                      ? 'w-1.5 bg-primary/60'
                      : 'w-1.5 bg-border'
                )}
              />
            ))}
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          {children}
        </Box>
      </div>
    </div>
  )
}
