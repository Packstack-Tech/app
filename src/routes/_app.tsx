import { createFileRoute, redirect } from '@tanstack/react-router'

import { AppLayout } from '@/containers/Layout/App'
import { userQueryOptions } from '@/queries/user'

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(userQueryOptions)
    } catch {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: AppLayout,
})
