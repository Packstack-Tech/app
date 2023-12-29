import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/containers/Layout/App'
import { AuthLayout } from '@/containers/Layout/Auth'
import { Dashboard } from '@/pages/Dashboard'
import { InventoryPage } from '@/pages/Inventory'
import { LoginPage } from '@/pages/Login'
import { PackPage } from '@/pages/PackPage'
import { RegisterPage } from '@/pages/Register'
import { RequestPasswordReset } from '@/pages/RequestPasswordReset'
import { ResetPassword } from '@/pages/ResetPassword'
import { Settings } from '@/pages/Settings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/inventory',
        element: <InventoryPage />,
      },
      {
        path: '/pack/new',
        element: <PackPage />,
      },
      {
        path: '/pack/:id',
        element: <PackPage />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'request-password-reset',
        element: <RequestPasswordReset />,
      },
      {
        path: 'reset-password/:callback_id',
        element: <ResetPassword />,
      },
    ],
  },
])
