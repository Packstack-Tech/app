import {
  createItem,
  deleteItem,
  getInventory,
  getProductDetails,
  importLighterpack,
  updateCategorySortOrder,
  updateItem,
  updateItemSortOrder,
} from "@/lib/api"
import { UpdateItemSortOrder, UploadInventory } from "@/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreateItem, EditItem } from "@/types/item"
import { useToast } from "@/hooks/useToast"
import { Mixpanel } from "@/lib/mixpanel"

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
    mutationFn: async (item: CreateItem) => {
      const res = await createItem(item)
      Mixpanel.track("Item:Create")
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
      Mixpanel.track("Item:Update")
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
      Mixpanel.track("Category:Update")
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

type ProductDetailParams = {
  brandId?: number
  productId?: number
}

const PRODUCT_DETAILS_QUERY = "product-details-query"

export const useProductDetails = () => {
  return useMutation({
    mutationKey: [PRODUCT_DETAILS_QUERY],
    mutationFn: async (params: ProductDetailParams) => {
      const res = await getProductDetails(params)
      return res.data
    },
    retry: false,
    onSuccess: (data) => Mixpanel.track("ProductDetails:Fetch", data),
  })
}

export const useImportLighterpack = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ["import-lighterpack"],
    mutationFn: async (data: UploadInventory) => {
      const res = await importLighterpack(data)
      return res.data
    },
    onSuccess: (resp) => {
      if (resp.success) {
        toast({
          title: "✅ Inventory imported",
        })
        Mixpanel.track("Import:LighterPack:success", resp)
        queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY })
      } else {
        Mixpanel.track("Import:LighterPack:failure")
        const errors = resp.errors.map(
          ({ line, error }) => `Row ${line}: ${error}`
        )
        toast({
          title: "❌ Inventory import failed",
          description: errors.join("\n"),
        })
      }
    },
    onError: () => {
      Mixpanel.track("Import:LighterPack:failure")
      toast({
        title: "❌ Inventory import failed",
        description: "An unexpected error occurred. Please try again.",
      })
    },
  })
}
