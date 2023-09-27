import React from "react"
import ReactDOM from "react-dom/client"
import * as Sentry from "@sentry/react"
import { RouterProvider } from "react-router-dom"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { router } from "./router"
import "./index.css"

import { Toaster } from "@/components/ui/Toaster"

Sentry.init({
  dsn: "https://184194c188dacdabf7eacf38c54d26fc@o313912.ingest.sentry.io/4505836676186112",
  enabled: import.meta.env.PROD,
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ["localhost", /^https:\/\/api.packstack\.io\//],
    }),
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 0.2,
  // Session Replay
  replaysSessionSampleRate: 0.25, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={HTML5Backend}>
        <RouterProvider router={router} />
      </DndProvider>
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>
)
