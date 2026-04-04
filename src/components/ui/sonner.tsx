import { Toaster as Sonner, type ToasterProps } from 'sonner'

import { useDarkMode } from '@/hooks/useDarkMode'

export function Toaster({ ...props }: ToasterProps) {
  const { isDark } = useDarkMode()

  return (
    <Sonner
      theme={isDark ? 'dark' : 'light'}
      visibleToasts={1}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}
