import { SYSTEM_UNIT } from '@/lib/consts'
import { AvatarImage } from './image'
import { Trip } from './trip'

export type User = {
  id: number
  email: string
  username: string
  display_name?: string
  unit_weight: SYSTEM_UNIT
  unit_distance: string
  unit_temperature: string
  currency: string
  bio: string | null
  banned: boolean
  deactivated: boolean
  email_verified: boolean
  hide_table_headers: boolean | null

  instagram_url: string | null
  youtube_url: string | null
  twitter_url: string | null
  facebook_url: string | null
  snap_url: string | null
  personal_url: string | null

  avatar: AvatarImage | null
  inventory: any[]
  trips: Trip[]
  categories: any[]
}
