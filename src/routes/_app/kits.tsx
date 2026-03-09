import { createFileRoute } from '@tanstack/react-router'

import { KitsPage } from '@/pages/Kits'
import { kitsQueryOptions } from '@/queries/kit'

export const Route = createFileRoute('/_app/kits')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(kitsQueryOptions),
  component: KitsPage,
})
