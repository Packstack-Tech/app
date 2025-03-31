import { TripImage } from './image'
import { User } from './user'

type BaseTrip = {
  title: string
  location: string
  start_date?: string
  end_date?: string
  temp_min?: number
  temp_max?: number
  distance?: number
  notes?: string
}

export type CreateTrip = BaseTrip

export type TripFormProps = CreateTrip

export type EditTrip = CreateTrip & {
  id: number
  removed?: boolean
}

export type Trip = BaseTrip & {
  id: number
  uuid: string
  user_id: number
  published: boolean
  removed: boolean
  created_at: string
  updated_at: string

  user: User
  images: TripImage[]
}
