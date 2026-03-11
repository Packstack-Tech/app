import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router'

import { AuthLayout } from '@/containers/Layout/Auth'
import { userQueryOptions } from '@/queries/user'

export const Route = createFileRoute('/auth')({
  beforeLoad: async ({ context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(userQueryOptions)
      throw redirect({ to: '/' })
    } catch (err) {
      if (isRedirect(err)) throw err
    }
  },
  component: AuthLayout,
})
