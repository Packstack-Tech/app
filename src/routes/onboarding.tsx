import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router'

import { Onboarding } from '@/containers/Onboarding/Onboarding'
import { hikerProfilesQueryOptions } from '@/queries/hiker-profile'
import { userQueryOptions } from '@/queries/user'

export const Route = createFileRoute('/onboarding')({
  beforeLoad: async ({ context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(userQueryOptions)
    } catch {
      throw redirect({ to: '/auth/login' })
    }

    try {
      const profiles = await queryClient.ensureQueryData(
        hikerProfilesQueryOptions
      )
      if (profiles.length > 0) {
        throw redirect({ to: '/' })
      }
    } catch (err) {
      if (isRedirect(err)) throw err
    }
  },
  component: Onboarding,
})
