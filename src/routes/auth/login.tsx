import { Login } from '@/pages/Login'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/login')({
  component: Login,
})
