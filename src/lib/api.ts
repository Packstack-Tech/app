import { http } from "./base"
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CreateCategory,
  CreateBrand,
  DeleteTripImageResponse,
  UploadAvatar,
  UploadImage,
  UpdateUser,
  UpdateTripPhotoOrder,
  UpdateTripImage,
  CreateProduct,
  UpdateItemSortOrder,
  PackPayload,
  UpdatePackItemPayload,
  UploadInventory,
  ImportInventoryResponse,
  PasswordReset,
} from "@/types/api"
import { User } from "@/types/user"
import { Trip, CreateTrip, EditTrip } from "@/types/trip"
import { Resources, Brand, BrandProducts, Product } from "@/types/resources"
import { TripImage } from "@/types/image"
import { Category, ItemCategory } from "@/types/category"
import { EditItem, Item, ItemForm, ProductDetails } from "@/types/item"
import { Pack } from "@/types/pack"

/**
 * User endpoints
 */
export const getUser = () => http.get<User>("/user")

export const getProfile = (username: string) =>
  http.get<User>(`/user/profile/${username}`)

export const uploadUserAvatar = (data: UploadAvatar) => {
  const formData = new FormData()
  formData.append("file", data.file)

  return http.post<User>("/user/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const updateUser = (data: UpdateUser) => http.put<User>("/user", data)

export const userLogin = (data: LoginRequest) =>
  http.post<AuthResponse>("/user/login", data)

export const userRegister = (data: RegisterRequest) =>
  http.post<AuthResponse>("/user", data)

export const requestPasswordReset = (email: string) =>
  http.post("/user/request-password-reset", { email })

export const resetPassword = (data: PasswordReset) =>
  http.post("/user/reset-password", data)

/**
 * Trip endpoints
 */

export const getTripFeed = () => http.get<Trip[]>("/trip")

export const getTrip = (tripId?: string | number) =>
  http.get<Trip>(`/trip/${tripId}`)

export const createTrip = (data: CreateTrip) => http.post<Trip>("/trip", data)

export const editTrip = (data: EditTrip) => http.put<Trip>("/trip", data)

export const cloneTrip = (tripId: number) =>
  http.post<Trip>(`/trip/${tripId}/clone`)

export const uploadTripImage = (data: UploadImage) => {
  const formData = new FormData()
  formData.append("file", data.file)

  return http.post<TripImage>(
    `/trip/${data.entity_id}/upload-image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )
}

export const updateTripImage = (data: UpdateTripImage) =>
  http.put<TripImage>(`/trip/${data.pack_id}/image/${data.image_id}`, {
    caption: data.caption,
  })

export const deleteTripImage = (tripId: number, imageId: number) =>
  http.delete<DeleteTripImageResponse>(`/trip/${tripId}/image/${imageId}`)

export const updateImageOrder = (data: UpdateTripPhotoOrder) =>
  http.post<boolean>(`/trip/${data.pack_id}/sort-photos`, data.sort_order)

export const deleteTrip = (tripId: number) =>
  http.delete<boolean>(`/trip/${tripId}`)

export const toggleTripPublish = (tripId: number) =>
  http.put<Trip>(`/trip/${tripId}/publish`)

/**
 * Pack endpoints
 */

export const getPacks = () => http.get<Pack[]>("/packs")

export const getPack = (id?: string | number) => http.get<Pack>(`/pack/${id}`)

export const getTripPacks = (tripId?: string | number) =>
  http.get<Pack[]>(`/pack/trip/${tripId}`)

export const createPack = (data: PackPayload) => http.post<Pack>("/pack", data)

export const updatePack = (packId: number, data: PackPayload) =>
  http.put(`/pack/${packId}`, data)

export const updatePackItem = (
  packId: number,
  itemId: number,
  data: UpdatePackItemPayload
) => http.put<boolean>(`/pack/${packId}/item/${itemId}`, data)

export const assignPack = (packId: number, trip_id?: number) =>
  http.put<Pack>(`/pack/${packId}/assign`, { trip_id })

export const deletePack = (packId: number) => http.delete(`/pack/${packId}`)

export const generatePack = (packId: number) =>
  http.post<Trip>(`/pack/${packId}/generate`)

export const getUnassignedPacks = () =>
  http.get<Pack[]>("/pack/legacy/unassigned")

/**
 * Category endpoints
 */

export const getCategories = () => http.get<Category[]>("/category")

export const createCategory = (data: CreateCategory) =>
  http.post<ItemCategory>("/category", data)

/**
 * Brand endpoints
 */

export const getBrands = () => http.get<Brand[]>("/resources/brands")

export const createBrand = (data: CreateBrand) =>
  http.post<Brand>("/resources/brand", data)

/**
 * Product endpoints
 */

export const getProducts = (brandId?: number) =>
  http.get<BrandProducts>(`/resources/brand/${brandId}`)

export const createProduct = (data: CreateProduct) =>
  http.post<Product>("/resources/product", data)

/**
 * Item endpoints
 */

export const getInventory = () => http.get<Item[]>("/items")

export const createItem = (data: ItemForm) => http.post<Item>("/item", data)

export const deleteItem = (itemId: number) => http.delete(`/item/${itemId}`)

export const updateItem = (data: EditItem) => http.put<Item>("/item", data)

export const updateItemSortOrder = (data: UpdateItemSortOrder) =>
  http.put("/item/sort", data)

export const updateCategorySortOrder = (data: UpdateItemSortOrder) =>
  http.put("/item/category/sort", data)

export const importInventory = (data: UploadInventory) => {
  const formData = new FormData()
  formData.append("file", data.file)

  return http.post<ImportInventoryResponse>("/item/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const getProductDetails = (data: {
  brandId?: number
  productId?: number
}) => http.post<ProductDetails>(`/item/product-details`, data)

/**
 * Misc endpoints
 */

export const getResources = () => http.get<Resources>("/resources")
