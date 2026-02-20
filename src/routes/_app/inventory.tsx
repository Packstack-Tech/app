import { createFileRoute } from '@tanstack/react-router'

import { InventoryPage } from '@/pages/Inventory'
import { inventoryQueryOptions } from '@/queries/item'

export const Route = createFileRoute('/_app/inventory')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(inventoryQueryOptions),
  component: InventoryPage,
})
