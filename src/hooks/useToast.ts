import { toast as sonnerToast } from 'sonner'

type ToastOptions = {
  title: React.ReactNode
  description?: React.ReactNode
  duration?: number
}

function toast({ title, description, duration }: ToastOptions) {
  return sonnerToast(title, { description, duration })
}

function useToast() {
  return { toast }
}

export { toast, useToast }
