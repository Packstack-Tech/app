import { FC } from 'react'

import { Box } from '../ui'

interface Props {
  subheading?: string
  heading?: string
  children?: React.ReactNode
}

export const EmptyState: FC<Props> = ({ subheading, heading, children }) => (
  <Box className="p-8">
    {subheading && (
      <p className="text-xs uppercase font-semibold">{subheading}</p>
    )}
    {heading && <h4 className="mb-3">{heading}</h4>}
    {children}
  </Box>
)
