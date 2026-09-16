import { createFileRoute, redirect } from '@tanstack/react-router'

// The Gear Closet is the landing page on web. Packs live at /packs.
export const Route = createFileRoute('/_app/')({
  beforeLoad: () => {
    throw redirect({ to: '/inventory' })
  },
})
