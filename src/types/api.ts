import { SortOrder } from "./image"
import { User } from "./user"

export type LoginRequest = {
  emailOrUsername: string
  password: string
}

export type RegisterRequest = {
  email: string
  username: string
  password: string
}

export type AuthResponse = {
  user: User
  token: string
}

export type UploadAvatar = {
  file: File
}

export type UploadInventory = {
  file: File
}

export type UploadImage = {
  file: File
  entity_id: number
}

export type UpdateUser = {
  display_name?: string
  username?: string
  unit_temperature?: string
  unit_distance?: string
  bio?: string | null
  instagram_url?: string
  youtube_url?: string
  twitter_url?: string
  reddit_url?: string
  snap_url?: string
  personal_url?: string
  hide_table_headers?: boolean
}

export type UpdateTripPhotoOrder = {
  pack_id: number
  sort_order: SortOrder[]
}

export type UpdateTripImage = {
  pack_id: number
  image_id: number
  caption: string | null
}

export type DeleteTripImageResponse = {
  trip_id: string
  image_id: string
}

export type CreateCategory = {
  name: string
  consumable?: boolean
}

export type CreateBrand = {
  name: string
}

export type CreateProduct = {
  brand_id: number
  name: string
}

export type ItemSortOrder = {
  id: number
  sort_order: number
}

export type UpdateItemSortOrder = ItemSortOrder[]

type PackItem = {
  item_id: number
  quantity: number
  worn: boolean
  sort_order: number
}

export type PackPayload = {
  title: string
  trip_id?: number
  items: PackItem[]
}

export type UpdatePackItemPayload = {
  checked: boolean
}

export type LineError = { line: number; error: string }

export type ImportInventoryResponse = {
  success: boolean
  errors: LineError[]
  count: number
}

export type PasswordReset = {
  password: string
  callback_id: string
}
