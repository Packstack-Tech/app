import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { useToast } from '@/hooks/useToast'
import { createKit, deleteKit, getKits, updateKit } from '@/lib/api'
import { KitPayload } from '@/types/kit'

export const KITS_QUERY = ['kits-query']

export const kitsQueryOptions = queryOptions({
  queryKey: KITS_QUERY,
  queryFn: async () => {
    const res = await getKits()
    return res.data
  },
})

export const useKits = () => {
  return useQuery({
    queryKey: KITS_QUERY,
    queryFn: async () => {
      const res = await getKits()
      return res.data
    },
  })
}

export const useCreateKit = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (data: KitPayload) => {
      const res = await createKit(data)
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Kit created' })
      queryClient.invalidateQueries({ queryKey: KITS_QUERY })
    },
    onError: () => {
      toast({ title: 'Failed to create kit' })
    },
  })
}

export const useUpdateKit = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: KitPayload }) => {
      const res = await updateKit(id, data)
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Kit updated' })
      queryClient.invalidateQueries({ queryKey: KITS_QUERY })
    },
    onError: () => {
      toast({ title: 'Failed to update kit' })
    },
  })
}

export const useDeleteKit = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (id: number) => {
      await deleteKit(id)
    },
    onSuccess: () => {
      toast({ title: 'Kit deleted' })
      queryClient.invalidateQueries({ queryKey: KITS_QUERY })
    },
    onError: () => {
      toast({ title: 'Failed to delete kit' })
    },
  })
}
