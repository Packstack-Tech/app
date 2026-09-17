import { Helmet } from 'react-helmet-async'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { ConnectAuthorize } from '@/pages/ConnectAuthorize'
import { userQueryOptions } from '@/queries/user'

type ConnectSearch = { request?: string }

/**
 * OAuth consent for the MCP connector. Lives outside `_app` on purpose: it
 * must not redirect a brand-new account into onboarding mid-handshake, and it
 * renders without the app chrome. Logged-out users go through login and come
 * straight back here.
 */
export const Route = createFileRoute('/connect/authorize')({
  validateSearch: (search: Record<string, unknown>): ConnectSearch => ({
    request: typeof search.request === 'string' ? search.request : undefined,
  }),
  beforeLoad: async ({ context: { queryClient }, search }) => {
    try {
      await queryClient.ensureQueryData(userQueryOptions)
    } catch {
      const back = search.request
        ? `/connect/authorize?request=${encodeURIComponent(search.request)}`
        : '/connect/authorize'
      throw redirect({ to: '/auth/login', search: { redirect: back } })
    }
  },
  component: ConnectAuthorizeRoute,
})

function ConnectAuthorizeRoute() {
  const { request } = Route.useSearch()
  return (
    <>
      <Helmet>
        <title>Connect an app | Packstack</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <ConnectAuthorize requestId={request} />
    </>
  )
}
