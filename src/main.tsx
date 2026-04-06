import './index.css'

import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import * as Sentry from '@sentry/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/Tooltip'

import { queryClient } from './lib/queryClient'
import { router } from './router'

if (!('theme' in localStorage) || localStorage.theme === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: import.meta.env.PROD,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracePropagationTargets: ['localhost', /^https:\/\/api.packstack\.io\//],
  // Performance Monitoring
  tracesSampleRate: 0.2,
  // Session Replay
  replaysSessionSampleRate: 0.25,
  replaysOnErrorSampleRate: 1.0,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={HTML5Backend}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <TooltipProvider delayDuration={0}>
            <RouterProvider
              router={router}
              context={{ queryClient }}
            />
          </TooltipProvider>
        </GoogleOAuthProvider>
      </DndProvider>
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>
)
