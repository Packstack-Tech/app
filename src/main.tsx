import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { router } from "./router"
import "./index.css"

import { Toaster } from "@/components/ui/Toaster"

const queryClient = new QueryClient()

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
