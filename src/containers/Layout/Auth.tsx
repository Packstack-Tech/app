import { Outlet } from 'react-router-dom'

import { Box } from '@/components/ui'

export const AuthLayout = () => {
  return (
    <div className="my-24">
      <div className="container max-w-sm">
        <Box>
          <Outlet />
        </Box>
      </div>
    </div>
  )
}
