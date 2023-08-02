export type Option = {
  label: string
  value: number | string
}

export type CreateableOption = {
  label: string
  value?: number | string
  isNew?: boolean
}
