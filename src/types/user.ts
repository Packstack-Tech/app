import { DISTANCE, SYSTEM_UNIT } from '@/lib/consts'
import { Currency } from '@/lib/currencies'

import { AvatarImage } from './image'
import { Unit } from './item'
import { Trip } from './trip'

export type OverpackMode = 'off' | 'warn' | 'block'

export type User = {
  id: number
  email: string
  username: string
  display_name?: string
  unit_weight: SYSTEM_UNIT
  unit_distance: DISTANCE
  unit_temperature: string
  currency: string
  bio: string | null
  banned: boolean
  deactivated: boolean
  email_verified: boolean
  is_subscribed: boolean
  hide_table_headers: boolean | null
  /** Over-pack check: packing more of an item than the closet says you own. */
  overpack_mode: OverpackMode
  overpack_include_consumables: boolean

  instagram_url: string | null
  youtube_url: string | null
  twitter_url: string | null
  facebook_url: string | null
  snap_url: string | null
  personal_url: string | null
  avatar: AvatarImage | null
  trips: Trip[]
}

export type UserInfo = Omit<User, 'currency'> & {
  currency: Currency
  conversion_unit: Unit
}
