import { createFileRoute } from '@tanstack/react-router'

import { PackPage } from '@/pages/PackPage'

export const Route = createFileRoute('/_app/pack/new')({
  component: PackPage,
})
