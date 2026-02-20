import { AxiosError, isAxiosError } from 'axios'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ExceptionOptions = {
  onHttpError?: (error: AxiosError<{ detail: string }>) => void
  onUnknownError?: (error: Error | unknown) => void
}

export const handleException = (
  error: Error | unknown,
  options: ExceptionOptions
) => {
  if (isAxiosError(error)) {
    options.onHttpError?.(error)
  } else {
    console.log(error)
    options.onUnknownError?.(error)
  }
}

export const dateToUtc = (date: Date) => {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000)
}

/**
 * Maps an array of `{ id, name }` records to `{ label, value }` options
 * for use in select/combobox components.
 */
export function toSelectOptions<T extends { id: number; name: string }>(
  items: T[] | undefined
): { label: string; value: number }[] {
  return (items || []).map(({ id, name }) => ({ label: name, value: id }))
}
