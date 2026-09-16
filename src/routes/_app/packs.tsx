import { createFileRoute } from '@tanstack/react-router'

import { PacksPage } from '@/pages/Packs'

export const Route = createFileRoute('/_app/packs')({
  component: PacksPage,
})
