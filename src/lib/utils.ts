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
