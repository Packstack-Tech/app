import { createRouter } from '@tanstack/react-router'

import { queryClient } from '@/lib/queryClient'

import { routeTree } from './routeTree.gen'

// Create the router instance
export const router = createRouter({
  routeTree,
  context: {
    queryClient: queryClient,
  },
})

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
