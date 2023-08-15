import {
  createItem,
  deleteItem,
  getInventory,
  updateCategorySortOrder,
  updateItem,
  updateItemSortOrder,
} from "@/lib/api"
import { UpdateItemSortOrder } from "@/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { EditItem, ItemForm } from "@/types/item"
import { useToast } from "@/hooks/useToast"

const INVENTORY_QUERY = ["inventory-query"]

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

export const useCreateItem = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (item: ItemForm) => {
      const res = await createItem(item)
      return res.data
    },
    onSuccess: () => {
      toast({
        title: "✅ Item created",
      })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
    },
  })
}

export const useDeleteItem = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (itemId: number) => {
      const res = await deleteItem(itemId)
      return res.data
    },
    onSuccess: () => {
      toast({
        title: "✅ Item deleted",
      })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
    },
  })
}

export const useUpdateItem = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (item: EditItem) => {
      const res = await updateItem(item)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      toast({
        title: "✅ Item updated",
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
      return res.data
    },
    onSuccess: () => {
      toast({
        title: "✅ Sort order updated",
      })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
    },
  })
}

export const useUpdateCategorySort = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (sortOrder: UpdateItemSortOrder) => {
      const res = await updateCategorySortOrder(sortOrder)
      return res.data
    },

    onSuccess: () => {
      toast({
        title: "Category order updated",
      })
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
    },
  })
}

// export const useImportInventory = () => {
//   const queryClient = useQueryClient()
//   return useMutation(
//     async (data: UploadInventory) => {
//       const res = await importInventory(data)
//       return res.data
//     },
//     {
//       onSuccess: () => queryClient.invalidateQueries(INVENTORY_QUERY)
//     }
//   )
// }
