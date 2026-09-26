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
import {
  Category,
  CategoryItems,
  ItemCategory,
  MyCategories,
} from '@/types/category'
import { HikerProfile, HikerProfilePayload } from '@/types/hiker-profile'
import {
  AllBenchmarks,
  CategoryBenchmarks,
  CreateItem,
  CreateItemLog,
  EditItem,
  Item,
  ItemLogEntry,
  ReplacementScoreResponse,
} from '@/types/item'
import { Kit, KitPayload } from '@/types/kit'
import { ConsentDecision, ConsentDetails, OAuthGrant } from '@/types/oauth'
import { Pack } from '@/types/pack'
import {
  CatalogBrand,
  CatalogProduct,
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

// Permanently deletes the account and everything under it. Same endpoint the
// mobile app uses.
export const deleteAccount = () => http.delete('/user')

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

/** Trip + packs + totals as markdown for pasting into an AI assistant. Public; keyed on trip uuid or id. */
export const getTripAiReview = (tripKey: string | number) =>
  http.get<string>(`/trip/${tripKey}/ai-review`, {
    responseType: 'text',
    headers: { Accept: 'text/markdown' },
  })

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

export const getMyCategories = () => http.get<MyCategories>('/category/mine')

export const createCategory = (name: string) =>
  http.post<ItemCategory>('/category', { name })

export const mergeCategory = (categoryId: number, intoCategoryId: number) =>
  http.post<ItemCategory>(`/category/${categoryId}/merge`, {
    into_category_id: intoCategoryId,
  })

export const deleteCategory = (categoryId: number) =>
  http.delete(`/category/${categoryId}`)

/**
 * Catalog endpoints
 */

export const searchCatalogBrands = (q: string) =>
  http.get<CatalogBrand[]>('/resources/catalog/search', { params: { q } })

export const searchCatalogProducts = (brand: string, q?: string) =>
  http.get<CatalogProductOption[]>('/resources/catalog/search', {
    params: { brand, ...(q ? { q } : {}) },
  })

/**
 * Freeform gear search across brand, product and subcategory names.
 * `compact` requests the trimmed payload used by the quick-add typeahead.
 */
export const searchCatalogGear = (q: string, compact = false) =>
  http.get<CatalogProduct[]>('/resources/catalog/products/search', {
    params: compact ? { q, compact: 1 } : { q },
  })

/** The one catalog product (with variants) for a brand + product name, or null. */
export const getCatalogProduct = (brand: string, product: string) =>
  http.get<CatalogProduct | null>('/resources/catalog/search', {
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

export const archiveItem = (itemId: number) => http.delete(`/item/${itemId}`)

export const deleteItem = (itemId: number) =>
  http.post(`/item/${itemId}/delete`)

export const detachItemCatalog = (itemId: number) =>
  http.delete(`/item/${itemId}/catalog`)

export const bulkArchiveItems = (ids: number[]) =>
  http.put('/item/bulk-archive', ids)

export const bulkRestoreItems = (ids: number[]) =>
  http.put('/item/bulk-restore', ids)

export const bulkDeleteItems = (ids: number[]) =>
  http.post('/item/bulk-delete', ids)

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

export const getItemLogs = (itemId: number) =>
  http.get<ItemLogEntry[]>(`/item/${itemId}/log`)

export const createItemLog = (itemId: number, data: CreateItemLog) =>
  http.post<ItemLogEntry>(`/item/${itemId}/log`, data)

export const updateItemLog = (itemId: number, logId: number, data: CreateItemLog) =>
  http.put<ItemLogEntry>(`/item/${itemId}/log/${logId}`, data)

export const updateItemLifecycle = (itemId: number, data: Record<string, unknown>) =>
  http.put<Item>(`/item/${itemId}/lifecycle`, data)

export const getReplacementScore = (itemId: number) =>
  http.get<ReplacementScoreResponse>(`/item/${itemId}/replacement-score`)

export const getBenchmarks = () =>
  http.get<AllBenchmarks>('/benchmark')

export const updateBenchmark = (categoryName: string, data: Partial<CategoryBenchmarks>) =>
  http.put<AllBenchmarks>(`/benchmark/${categoryName}`, data)

export const resetBenchmark = (categoryName: string) =>
  http.delete(`/benchmark/${categoryName}`)

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

/**
 * Hiker Profile endpoints
 */

export const getHikerProfiles = () =>
  http.get<HikerProfile[]>('/hiker-profile')

export const createHikerProfile = (data: HikerProfilePayload) =>
  http.post<HikerProfile>('/hiker-profile', data)

export const updateHikerProfile = (id: number, data: Partial<HikerProfilePayload>) =>
  http.put<HikerProfile>(`/hiker-profile/${id}`, data)


// --- MCP connector / OAuth ---------------------------------------------------
// Consent is completed by the web app (cookie session); Connected apps lists
// and revokes grants. All four are cookie-authenticated.
export const getConsentDetails = (requestId: string) =>
  http.get<ConsentDetails>(`/oauth/consent/${encodeURIComponent(requestId)}`)
export const decideConsent = (data: ConsentDecision) =>
  http.post<{ redirect_to: string }>('/oauth/consent', data)
export const getOAuthGrants = () => http.get<OAuthGrant[]>('/oauth/grants')
export const revokeOAuthGrant = (grantId: number) =>
  http.delete(`/oauth/grants/${grantId}`)
