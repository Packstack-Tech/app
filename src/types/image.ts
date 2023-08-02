type Image = {
  user_id: number
  id: number
  avatar: boolean
  caption: string | null
  sort_order: number
  s3_key: string
  s3_key_thumb: string
  s3_url: string
  s3_url_thumb: string
  created_at: string
}

export type SortOrder = {
  id: number
  sort_order: number
}

export type AvatarImage = Image

export type ItemImage = Image & {
  item_id: number
}

export type TripImage = Image & {
  pack_id: number
}

export type PostImage = Image & {
  post_id: number
}
