import { createFileRoute } from '@tanstack/react-router'

import { InventoryPage } from '@/pages/Inventory'
import { inventoryQueryOptions } from '@/queries/item'

export const Route = createFileRoute('/_app/inventory/$itemId')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(inventoryQueryOptions),
  component: () => {
    const { itemId } = Route.useParams()
    return <InventoryPage initialItemId={Number(itemId)} />
  },
})
