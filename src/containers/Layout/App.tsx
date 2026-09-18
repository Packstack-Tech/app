import { Outlet } from '@tanstack/react-router'

import { GetAppBanner } from '@/containers/GetAppBanner'
import { Header } from '@/containers/Header'

export const AppLayout = () => {
  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <GetAppBanner />
      <Header />
      <main className="flex flex-col flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
