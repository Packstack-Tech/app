import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const boxVariants = cva('border shadow shadow-black/5 rounded-sm px-6 py-4')

export interface BoxProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants> {
  asChild?: boolean
}

export const Box = ({ className, ref, ...props }: BoxProps & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={cn(boxVariants({ className }))} {...props} />
)
