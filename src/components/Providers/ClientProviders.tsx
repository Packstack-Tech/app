'use client'

import { FC, ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import type { Session } from 'next-auth'

import { http } from '@/lib/base'

const queryClient = new QueryClient()

export const ClientProviders: FC<{
  children: ReactNode
  session: Session | null
}> = ({ children, session }) => {
  // Set the auth header for all requests
  http.defaults.headers.common[
    'Authorization'
  ] = `Bearer ${session?.accessToken}`

  return (
    <SessionProvider session={session as Session}>
      <QueryClientProvider client={queryClient}>
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
