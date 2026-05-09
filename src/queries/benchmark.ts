import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { useToast } from '@/hooks/useToast'
import { getBenchmarks, resetBenchmark, updateBenchmark } from '@/lib/api'
import { Mixpanel } from '@/lib/mixpanel'
import { CategoryBenchmarks } from '@/types/item'

const BENCHMARK_QUERY = ['benchmarks']

export const useBenchmarks = () => {
  return useQuery({
    queryKey: BENCHMARK_QUERY,
    queryFn: async () => {
      const res = await getBenchmarks()
      return res.data
    },
  })
}

export const useUpdateBenchmark = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async ({
      categoryName,
      data,
    }: {
      categoryName: string
      data: Partial<CategoryBenchmarks>
    }) => {
      const res = await updateBenchmark(categoryName, data)
      Mixpanel.track('Benchmark:Update', { category: categoryName })
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Benchmark updated' })
      queryClient.invalidateQueries({ queryKey: BENCHMARK_QUERY })
    },
  })
}

export const useResetBenchmark = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (categoryName: string) => {
      await resetBenchmark(categoryName)
      Mixpanel.track('Benchmark:Reset', { category: categoryName })
    },
    onSuccess: () => {
      toast({ title: 'Benchmark reset to default' })
      queryClient.invalidateQueries({ queryKey: BENCHMARK_QUERY })
    },
  })
}
