import { useMemo } from 'react'
import { isAxiosError } from 'axios'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createCategory,
  deleteCategory,
  getCategories,
  getMyCategories,
  mergeCategory,
  updateCategory,
  updateCategorySortOrder,
} from '@/lib/api'
import { Mixpanel } from '@/lib/mixpanel'
import { GROUPED_INVENTORY_QUERY, INVENTORY_QUERY } from '@/queries/item'
import { CategoryConflict } from '@/types/category'
import { Option } from '@/types/lib'

export const CATEGORY_QUERY = 'categories'
const MY_CATEGORIES_QUERY = [CATEGORY_QUERY, 'mine']

/**
 * Every category the user can pick (their own + shared). Still used by
 * quick-add's catalog → category name matching.
 */
export const useCategories = () => {
  return useQuery({
    queryKey: [CATEGORY_QUERY],
    queryFn: async () => {
      const res = await getCategories()
      return res.data
    },
  })
}

/** The user's own category list (including empty ones) plus suggestions. */
export const useMyCategories = () => {
  return useQuery({
    queryKey: MY_CATEGORIES_QUERY,
    queryFn: async () => {
      const res = await getMyCategories()
      return res.data
    },
  })
}

/** The 409 detail when a rename collides with an existing category name. */
export const getCategoryConflict = (
  error: unknown
): CategoryConflict | null => {
  if (!isAxiosError(error) || error.response?.status !== 409) return null
  const detail = error.response.data?.detail
  return detail?.code === 'category_exists' ? detail : null
}

const useInvalidateCategories = () => {
  const queryClient = useQueryClient()
  return () => {
    // [CATEGORY_QUERY] prefix-matches the "mine" query too.
    queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY] })
    queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
    queryClient.invalidateQueries({ queryKey: GROUPED_INVENTORY_QUERY })
  }
}

export const useCreateCategory = () => {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await createCategory(name)
      return res.data
    },
    onSuccess: () => {
      Mixpanel.track('Category:Create')
      invalidate()
    },
  })
}

export const useRenameCategory = () => {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: async ({ categoryId, name }: { categoryId: number; name: string }) => {
      const res = await updateCategory(categoryId, name)
      return res.data
    },
    onSuccess: () => {
      Mixpanel.track('Category:Rename')
      invalidate()
    },
  })
}

export const useMergeCategory = () => {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: async ({
      categoryId,
      intoCategoryId,
    }: {
      categoryId: number
      intoCategoryId: number
      source?: 'menu' | 'rename_conflict'
    }) => {
      const res = await mergeCategory(categoryId, intoCategoryId)
      return res.data
    },
    onSuccess: (_data, { source }) => {
      Mixpanel.track('Category:Merge', { source: source ?? 'menu' })
      invalidate()
    },
  })
}

export const useDeleteCategory = () => {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: async ({
      categoryId,
    }: {
      categoryId: number
      itemCount: number
      shared: boolean
    }) => {
      await deleteCategory(categoryId)
    },
    onSuccess: (_data, { itemCount, shared }) => {
      Mixpanel.track('Category:Delete', { item_count: itemCount, shared })
      invalidate()
    },
  })
}

/** Takes ItemCategory ids in their new order. */
export const useReorderCategories = () => {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: async (itemCategoryIds: number[]) => {
      await updateCategorySortOrder(
        itemCategoryIds.map((id, sort_order) => ({ id, sort_order }))
      )
    },
    onSuccess: () => {
      Mixpanel.track('Category:Reorder')
      invalidate()
    },
  })
}

/**
 * Options for the item form's category picker: the user's categories in
 * their own order, then shared ones they haven't used under "Suggested".
 * `categories` is the same list as { id: Category id, name } for name
 * matching (the user's own come first, so they win).
 */
export const useCategoryOptions = () => {
  const { data } = useMyCategories()
  return useMemo(() => {
    const mine = data?.categories ?? []
    const suggested = data?.suggested ?? []
    const categories = [
      ...mine.map(c => ({ id: c.category_id, name: c.name })),
      ...suggested.map(c => ({ id: c.category_id, name: c.name })),
    ]
    const options: Option[] = [
      ...mine.map(c => ({
        label: c.name,
        value: c.category_id,
        group: suggested.length ? 'Your categories' : undefined,
      })),
      ...suggested.map(c => ({
        label: c.name,
        value: c.category_id,
        group: 'Suggested',
      })),
    ]
    return { options, categories }
  }, [data])
}
