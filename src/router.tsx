import { createRouter } from '@tanstack/react-router'

import { Loading } from '@/components/ui/Loading'
import { queryClient } from '@/lib/queryClient'

import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  context: {
    queryClient: queryClient,
  },
  defaultPendingComponent: Loading,
  defaultPendingMs: 200,
  defaultPendingMinMs: 300,
})

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
