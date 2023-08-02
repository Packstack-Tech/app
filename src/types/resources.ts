export type Condition = {
  id: number
  name: string
}

export type PackCondition = {
  condition: Condition
  pack_id: number
  condition_id: number
}

export type Geography = {
  id: number
  name: string
}

export type PackGeography = {
  geography: Geography
  pack_id: number
  geography_id: number
}

export type Resources = {
  conditions: Condition[]
  geographies: Geography[]
  currencies: { [key: string]: number }
  unitSystem: { [key: string]: number }
  weightUnits: { [key: string]: number }
}

export type Brand = {
  id: number
  name: string
  removed: boolean
}

export type Product = {
  id: number
  name: string
  brand_id: number
  removed: boolean
}

export type BrandProducts = Brand & {
  products: Product[]
}
