import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { useToast } from '@/hooks/useToast'
import {
  archiveItem,
  bulkArchiveItems,
  bulkDeleteItems,
  bulkRestoreItems,
  createItem,
  deleteItem,
  getGroupedInventory,
  getInventory,
  importInventory,
  importLighterpack,
  updateCategory,
  updateCategorySortOrder,
  updateItem,
  updateItemSortOrder,
} from '@/lib/api'
import { Mixpanel } from '@/lib/mixpanel'
import { CATEGORY_QUERY } from '@/queries/category'
import { CATALOG_BRANDS_QUERY, CATALOG_PRODUCTS_QUERY } from '@/queries/resources'
import { UpdateItemSortOrder, UploadInventory } from '@/types/api'
import { CategoryItems } from '@/types/category'
import { CreateItem, EditItem } from '@/types/item'

const INVENTORY_QUERY = ['inventory-query']
const GROUPED_INVENTORY_QUERY = ['grouped-inventory-query']

export const inventoryQueryOptions = queryOptions({
  queryKey: INVENTORY_QUERY,
  queryFn: async () => {
    const res = await getInventory()
    return res.data
  },
})

export const useInventory = (enabled: boolean = true) => {
  return useQuery({
    queryKey: INVENTORY_QUERY,
    queryFn: async () => {
      const res = await getInventory()
      return res.data
    },
    enabled,
  })
}

export const useGroupedInventory = () => {
  return useQuery({
    queryKey: GROUPED_INVENTORY_QUERY,
    queryFn: async () => {
      const res = await getGroupedInventory()
      return res.data
    },
  })
}

export const useCreateItem = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (item: CreateItem) => {
      const res = await createItem(item)
      Mixpanel.track('Item:Create')
      return res.data
    },
    onSuccess: () => {
      toast({
        title: '✅ Item created',
      })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: GROUPED_INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: [CATALOG_BRANDS_QUERY] })
      queryClient.invalidateQueries({ queryKey: [CATALOG_PRODUCTS_QUERY] })
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY] })
    },
  })
}

export const useDeleteItem = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (itemId: number) => {
      const res = await archiveItem(itemId)
      Mixpanel.track('Item:Archive')
      return res.data
    },
    onSuccess: () => {
      toast({
        title: '✅ Item archived',
      })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: GROUPED_INVENTORY_QUERY })
    },
  })
}

export const usePermanentlyDeleteItem = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (itemId: number) => {
      const res = await deleteItem(itemId)
      Mixpanel.track('Item:Delete')
      return res.data
    },
    onSuccess: () => {
      toast({
        title: '✅ Item permanently deleted',
      })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: GROUPED_INVENTORY_QUERY })
    },
  })
}

export const useBulkArchiveItems = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await bulkArchiveItems(ids)
      Mixpanel.track('Item:BulkArchive', { count: ids.length })
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Items archived' })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: GROUPED_INVENTORY_QUERY })
    },
  })
}

export const useBulkRestoreItems = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await bulkRestoreItems(ids)
      Mixpanel.track('Item:BulkRestore', { count: ids.length })
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Items restored' })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: GROUPED_INVENTORY_QUERY })
    },
  })
}

export const useBulkDeleteItems = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (ids: number[]) => {
      await bulkDeleteItems(ids)
      Mixpanel.track('Item:BulkDelete', { count: ids.length })
    },
    onSuccess: () => {
      toast({ title: 'Items permanently deleted' })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: GROUPED_INVENTORY_QUERY })
    },
  })
}

export const useUpdateItem = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (item: EditItem) => {
      const res = await updateItem(item)
      Mixpanel.track('Item:Update')
      return res.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: GROUPED_INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: ['item-logs', variables.id] })
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY] })
      toast({
        title: '✅ Item updated',
      })
    },
  })
}

export const useUpdateItemSort = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (sortOrder: UpdateItemSortOrder) => {
      const res = await updateItemSortOrder(sortOrder)
      Mixpanel.track('Item:Sort')
      return res.data
    },
    onSuccess: () => {
      toast({
        title: '✅ Sort order updated',
      })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: GROUPED_INVENTORY_QUERY })
    },
  })
}

export const useUpdateCategorySort = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (sortOrder: UpdateItemSortOrder) => {
      const res = await updateCategorySortOrder(sortOrder)
      Mixpanel.track('Category:Update')
      return res.data
    },

    onSuccess: () => {
      toast({
        title: 'Category order updated',
      })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: GROUPED_INVENTORY_QUERY })
    },
  })
}

type CategoryChange = {
  categories: CategoryItems[]
  renames: Record<number, string>
}

export const useSaveCategoryChanges = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async ({ categories, renames }: CategoryChange) => {
      const originalNames = new Map(
        categories
          .filter(rec => rec.category)
          .map(rec => [rec.category!.category.id, rec.category!.category.name])
      )

      const renamePromises = Object.entries(renames)
        .filter(([id, name]) => name.trim() && originalNames.get(Number(id)) !== name)
        .map(([id, name]) => updateCategory(Number(id), name))

      const sortOrder = categories
        .map((cat, fullIdx) =>
          cat.category
            ? { id: cat.category.id, sort_order: fullIdx }
            : null
        )
        .filter(
          (entry): entry is { id: number; sort_order: number } =>
            entry !== null
        )

      await Promise.all([
        ...renamePromises,
        updateCategorySortOrder(sortOrder),
      ])
      Mixpanel.track('Category:Save')
    },
    onSuccess: () => {
      toast({ title: 'Categories updated' })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: GROUPED_INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY] })
    },
    onError: () => {
      toast({ title: 'Failed to update categories' })
    },
  })
}

export const useImportLighterpack = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['import-lighterpack'],
    mutationFn: async (data: UploadInventory) => {
      const res = await importLighterpack(data)
      return res.data
    },
    onSuccess: resp => {
      if (resp.success) {
        toast({
          title: '✅ Inventory imported',
        })
        Mixpanel.track('Import:LighterPack:success', resp)
        queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: GROUPED_INVENTORY_QUERY })
      } else {
        Mixpanel.track('Import:LighterPack:failure')
        const errors = resp.errors.map(
          ({ line, error }) => `Row ${line}: ${error}`
        )
        toast({
          title: '❌ Inventory import failed',
          description: errors.join('\n'),
        })
      }
    },
    onError: () => {
      Mixpanel.track('Import:LighterPack:failure')
      toast({
        title: '❌ Inventory import failed',
        description: 'An unexpected error occurred. Please try again.',
      })
    },
  })
}

export const useImportInventory = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['import-csv'],
    mutationFn: async (data: UploadInventory) => {
      const res = await importInventory(data)
      return res.data
    },
    onSuccess: resp => {
      if (resp.success) {
        toast({
          title: '✅ Inventory imported',
        })
        Mixpanel.track('Import:CSV:success', resp)
        queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      queryClient.invalidateQueries({ queryKey: GROUPED_INVENTORY_QUERY })
      } else {
        Mixpanel.track('Import:CSV:failure')
        const errors = resp.errors.map(
          ({ line, error }) => `Row ${line}: ${error}`
        )
        toast({
          title: '❌ Inventory import failed',
          description: errors.join('\n'),
        })
      }
    },
    onError: () => {
      Mixpanel.track('Import:CSV:failure')
      toast({
        title: '❌ Inventory import failed',
        description: 'An unexpected error occurred. Please try again.',
      })
    },
  })
}
