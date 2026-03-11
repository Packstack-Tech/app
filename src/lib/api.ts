import {
  AuthResponse,
  ImportInventoryResponse,
  PackPayload,
  SendOtpRequest,
  UpdateItemSortOrder,
  UpdateUser,
  UploadAvatar,
  UploadInventory,
  VerifyOtpRequest,
} from '@/types/api'
import { Category, CategoryItems } from '@/types/category'
import { CreateItem, EditItem, Item } from '@/types/item'
import { Kit, KitPayload } from '@/types/kit'
import { Pack } from '@/types/pack'
import {
  CatalogBrand,
  CatalogEntry,
  CatalogProductOption,
} from '@/types/resources'
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

export const sendOtp = (data: SendOtpRequest) =>
  http.post<{ sent: boolean }>('/user/send-otp', data)

export const verifyOtp = (data: VerifyOtpRequest) =>
  http.post<AuthResponse>('/user/verify-otp', data)

export const googleAuth = (credential: string) =>
  http.post<AuthResponse>('/user/google-auth', { credential })

export const logout = () => http.post('/user/logout')

export const verifyEmail = (callbackId: string) =>
  http.post('/user/verify-email', { callback_id: callbackId })

export const resendVerificationEmail = () =>
  http.post('/user/resend-verification')

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
 * Catalog endpoints
 */

export const searchCatalogBrands = (q: string) =>
  http.get<CatalogBrand[]>('/resources/catalog/search', { params: { q } })

export const searchCatalogProducts = (brand: string, q?: string) =>
  http.get<CatalogProductOption[]>('/resources/catalog/search', {
    params: { brand, ...(q ? { q } : {}) },
  })

export const getCatalogEntries = (brand: string, product: string) =>
  http.get<CatalogEntry[]>('/resources/catalog/search', {
    params: { brand, product },
  })

/**
 * Kit endpoints
 */

export const getKits = () => http.get<Kit[]>('/kits')

export const getKit = (id: number) => http.get<Kit>(`/kit/${id}`)

export const createKit = (data: KitPayload) => http.post<Kit>('/kit', data)

export const updateKit = (id: number, data: KitPayload) =>
  http.put<Kit>(`/kit/${id}`, data)

export const deleteKit = (id: number) => http.delete(`/kit/${id}`)

/**
 * Item endpoints
 */

export const getInventory = () => http.get<Item[]>('/items')

export const getGroupedInventory = () =>
  http.get<CategoryItems[]>('/items/grouped')

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
