import { Outlet } from '@tanstack/react-router'

import logo from '/packstack_logo_white.png'
import { Box } from '@/components/ui'

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img
            src={logo}
            alt="Packstack"
            className="w-36 invert dark:invert-0"
          />
        </div>
        <Box className="px-8 py-6">
          <Outlet />
        </Box>
      </div>
    </div>
  )
}
