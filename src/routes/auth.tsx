import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router'

import { AuthLayout } from '@/containers/Layout/Auth'
import { userQueryOptions } from '@/queries/user'

type AuthSearch = { redirect?: string }

/** Only same-origin paths may be used as a post-login destination. */
export const safeRedirect = (value: unknown): string | undefined =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : undefined

export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: safeRedirect(search.redirect),
  }),
  beforeLoad: async ({ context: { queryClient }, search }) => {
    try {
      await queryClient.ensureQueryData(userQueryOptions)
      // Already signed in: continue to where they were headed (the MCP
      // consent page sends people here with ?redirect=), else the app.
      throw redirect({ to: (search.redirect as never) ?? '/' })
    } catch (err) {
      if (isRedirect(err)) throw err
    }
  },
  component: AuthLayout,
})
