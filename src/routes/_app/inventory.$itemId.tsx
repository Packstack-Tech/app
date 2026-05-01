import { createFileRoute } from '@tanstack/react-router'

import { ItemDetailPage } from '@/pages/ItemDetail'
import { inventoryQueryOptions } from '@/queries/item'

export const Route = createFileRoute('/_app/inventory/$itemId')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(inventoryQueryOptions),
  component: () => {
    const { itemId } = Route.useParams()
    return <ItemDetailPage mode="edit" itemId={Number(itemId)} />
  },
})
