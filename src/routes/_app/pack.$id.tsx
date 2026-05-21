import { createFileRoute } from '@tanstack/react-router'

import { PackPage } from '@/pages/PackPage'
import { tripPacksQueryOptions } from '@/queries/pack'
import { tripQueryOptions } from '@/queries/trip'

export const Route = createFileRoute('/_app/pack/$id')({
  loader: async ({ context: { queryClient }, params: { id } }) => {
    const [trip, packs] = await Promise.all([
      queryClient.fetchQuery(tripQueryOptions(id)),
      queryClient.fetchQuery(tripPacksQueryOptions(id)),
    ])
    return { trip, packs }
  },
  component: PackPage,
})
