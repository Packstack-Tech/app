import {
  AuthResponse,
  ImportInventoryResponse,
  LoginRequest,
  PackPayload,
  PasswordReset,
  RegisterRequest,
  UpdateItemSortOrder,
  UpdateUser,
  UploadAvatar,
  UploadInventory,
} from '@/types/api'
import { Category } from '@/types/category'
import {
  CreateItem,
  EditItem,
  Item,
  ProductDetails,
  ProductVariant,
} from '@/types/item'
import { Pack } from '@/types/pack'
import { Brand, BrandProducts } from '@/types/resources'
import { CreateTrip, EditTrip, Trip } from '@/types/trip'
import { User } from '@/types/user'

import { http } from './base'

/**
 * User endpoints
 */
export const getUser = () => http.get<User>('/user')

export const getProfile = (username: string) =>
  http.get<User>(`/user/profile/${username}`)

export const uploadUserAvatar = (data: UploadAvatar) => {
  const formData = new FormData()
  formData.append('file', data.file)

  return http.post<User>('/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const updateUser = (data: UpdateUser) => http.put<User>('/user', data)

export const userLogin = (data: LoginRequest) =>
  http.post<AuthResponse>('/user/login', data)

export const userRegister = (data: RegisterRequest) =>
  http.post<AuthResponse>('/user', data)

export const requestPasswordReset = (email: string) =>
  http.post('/user/request-password-reset', { email })

export const resetPassword = (data: PasswordReset) =>
  http.post('/user/reset-password', data)

/**
 * Trip endpoints
 */

export const getTrip = (tripId?: string | number) =>
  http.get<Trip>(`/trip/${tripId}`)

export const createTrip = (data: CreateTrip) => http.post<Trip>('/trip', data)

export const editTrip = (data: EditTrip) => http.put<Trip>('/trip', data)

export const cloneTrip = (tripId: number) =>
  http.post<Trip>(`/trip/${tripId}/clone`)

export const deleteTrip = (tripId: number) =>
  http.delete<boolean>(`/trip/${tripId}`)

/**
 * Pack endpoints
 */

export const getPack = (id?: string | number) => http.get<Pack>(`/pack/${id}`)

export const getTripPacks = (tripId?: string | number) =>
  http.get<Pack[]>(`/pack/trip/${tripId}`)

export const createPack = (data: PackPayload) => http.post<Pack>('/pack', data)

export const updatePack = (packId: number, data: PackPayload) =>
  http.put(`/pack/${packId}`, data)

export const deletePack = (packId: number) => http.delete(`/pack/${packId}`)

export const generatePack = (packId: number) =>
  http.post<Trip>(`/pack/${packId}/generate`)

export const getUnassignedPacks = () =>
  http.get<Pack[]>('/pack/legacy/unassigned')

/**
 * Category endpoints
 */

export const getCategories = () => http.get<Category[]>('/category')

export const updateCategory = (categoryId: number, name: string) =>
  http.put<Category>(`/category/${categoryId}`, { name })

/**
 * Brand endpoints
 */

export const getBrands = () => http.get<Brand[]>('/resources/brands')

export const searchBrands = (query: string) =>
  http.get<Brand[]>(`/resources/brand/search/${query}`)

/**
 * Product endpoints
 */

export const getProducts = (brandId?: number) =>
  http.get<BrandProducts>(`/resources/brand/${brandId}`)

export const getProductDetails = (data: {
  brandId?: number
  productId?: number
}) => http.post<ProductDetails>(`/resources/product-details`, data)

export const getProductVariants = (product_id?: number) =>
  http.get<ProductVariant[]>(`resources/product/variants/${product_id}`)

/**
 * Item endpoints
 */

export const getInventory = () => http.get<Item[]>('/items')

export const createItem = (data: CreateItem) => http.post<Item>('/item', data)

export const deleteItem = (itemId: number) => http.delete(`/item/${itemId}`)

export const bulkArchiveItems = (ids: number[]) =>
  http.put('/item/bulk-archive', ids)

export const bulkRestoreItems = (ids: number[]) =>
  http.put('/item/bulk-restore', ids)

export const updateItem = (data: EditItem) => http.put<Item>('/item', data)

export const updateItemSortOrder = (data: UpdateItemSortOrder) =>
  http.put('/item/sort', data)

export const updateCategorySortOrder = (data: UpdateItemSortOrder) =>
  http.put('/item/category/sort', data)

export const importInventory = (data: UploadInventory) => {
  const formData = new FormData()
  formData.append('file', data.file)

  return http.post<ImportInventoryResponse>('/item/import/csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const importLighterpack = (data: UploadInventory) => {
  const formData = new FormData()
  formData.append('file', data.file)

  return http.post<ImportInventoryResponse>(
    '/item/import/lighterpack',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
}
