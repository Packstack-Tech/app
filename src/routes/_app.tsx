import { createFileRoute, redirect } from '@tanstack/react-router'

import { AppLayout } from '@/containers/Layout/App'
import { userQueryOptions } from '@/queries/user'

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context: { queryClient } }) => {
    const token = localStorage.getItem('jwt')
    if (!token) {
      throw redirect({ to: '/auth/login' })
    }
    await queryClient.ensureQueryData(userQueryOptions)
  },
  component: AppLayout,
})
