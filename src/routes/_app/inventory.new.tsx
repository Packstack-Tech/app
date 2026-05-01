import { createFileRoute } from '@tanstack/react-router'

import { ItemDetailPage } from '@/pages/ItemDetail'

export const Route = createFileRoute('/_app/inventory/new')({
  component: () => <ItemDetailPage mode="create" />,
})
