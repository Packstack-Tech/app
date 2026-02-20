import { Outlet } from '@tanstack/react-router'

import { Header } from '@/containers/Header'

export const AppLayout = () => {
  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <Header />
      <main className="flex flex-col flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
