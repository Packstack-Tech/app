import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { useToast } from '@/hooks/useToast'
import {
  createItemLog,
  getItemLogs,
  getReplacementScore,
  updateItemLifecycle,
  updateItemLog,
} from '@/lib/api'
import { Mixpanel } from '@/lib/mixpanel'
import { CreateItemLog } from '@/types/item'

const INVENTORY_QUERY = ['inventory-query']
const GROUPED_INVENTORY_QUERY = ['grouped-inventory-query']

export const useItemLogs = (itemId: number | undefined) => {
  return useQuery({
    queryKey: ['item-logs', itemId],
    queryFn: async () => {
      const res = await getItemLogs(itemId!)
      return res.data
    },
    enabled: !!itemId,
  })
}

export const useCreateItemLog = (itemId: number) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (data: CreateItemLog) => {
      const res = await createItemLog(itemId, data)
      Mixpanel.track('ItemLog:Create', { event_type: data.event_type })
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Log entry added' })
      queryClient.invalidateQueries({ queryKey: ['item-logs', itemId] })
    },
  })
}

export const useUpdateItemLog = (itemId: number) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async ({ logId, data }: { logId: number; data: CreateItemLog }) => {
      const res = await updateItemLog(itemId, logId, data)
      Mixpanel.track('ItemLog:Update', { event_type: data.event_type })
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Log entry updated' })
      queryClient.invalidateQueries({ queryKey: ['item-logs', itemId] })
    },
  })
}

export const useUpdateLifecycle = (itemId: number) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await updateItemLifecycle(itemId, data)
      Mixpanel.track('Item:LifecycleUpdate')
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Lifecycle updated' })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: GROUPED_INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: ['item-logs', itemId] })
    },
  })
}

export const useReplacementScore = (itemId: number | undefined) => {
  return useQuery({
    queryKey: ['replacement-score', itemId],
    queryFn: async () => {
      const res = await getReplacementScore(itemId!)
      return res.data
    },
    enabled: !!itemId,
  })
}
