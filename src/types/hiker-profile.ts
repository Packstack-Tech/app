export type Sex = 'male' | 'female'
export type BodyType = 'average' | 'muscular'

export type HikerProfile = {
  id: number
  user_id: number
  name: string
  weight: number | null
  height: number | null
  year_of_birth: number | null
  sex: Sex | null
  body_type: BodyType | null
  is_default: boolean
  created_at: string
}

export type HikerProfilePayload = {
  name: string
  weight?: number | null
  height?: number | null
  year_of_birth?: number | null
  sex?: Sex | null
  body_type?: BodyType | null
  is_default?: boolean
}
