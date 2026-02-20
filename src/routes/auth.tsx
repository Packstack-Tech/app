import { createFileRoute } from '@tanstack/react-router'

import { AuthLayout } from '@/containers/Layout/Auth'

export const Route = createFileRoute('/auth')({
  component: AuthLayout,
})
