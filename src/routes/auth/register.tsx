import { createFileRoute } from '@tanstack/react-router'


import { Register } from '@/pages/Register'

export const Route = createFileRoute('/auth/register')({
  component: Register,
})