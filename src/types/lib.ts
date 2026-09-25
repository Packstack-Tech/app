export type Option = {
  label: string
  value: number | string
  /** Optional heading; options sharing one render together under it. */
  group?: string
}

export type CreateableOption = {
  label: string
  value?: number | string
  isNew?: boolean
}
