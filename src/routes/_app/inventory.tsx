import { createFileRoute, Outlet } from '@tanstack/react-router'

import { inventoryQueryOptions } from '@/queries/item'

export const Route = createFileRoute('/_app/inventory')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(inventoryQueryOptions),
  component: () => <Outlet />,
})
