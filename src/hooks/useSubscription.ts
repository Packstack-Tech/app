import { useCallback, useRef } from 'react'
import { Purchases } from '@revenuecat/purchases-js'
import { useQueryClient } from '@tanstack/react-query'

import { USER_QUERY } from '@/queries/user'

import { useUser } from './useUser'

const RC_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY ?? ''

function createModalOverlay(): { overlay: HTMLDivElement; container: HTMLDivElement } {
  const overlay = document.createElement('div')
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  })

  const container = document.createElement('div')
  Object.assign(container.style, {
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflow: 'auto',
    borderRadius: '12px',
  })

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove()
  })

  overlay.appendChild(container)
  document.body.appendChild(overlay)
  return { overlay, container }
}

export function useSubscription() {
  const user = useUser()
  const queryClient = useQueryClient()
  const purchasesRef = useRef<Purchases | null>(null)

  const isSubscribed = user?.is_subscribed ?? false

  const openUpgrade = useCallback(async () => {
    if (!RC_API_KEY || !user) return

    if (!purchasesRef.current) {
      purchasesRef.current = Purchases.configure({ apiKey: RC_API_KEY, appUserId: String(user.id) })
    }

    const { overlay, container } = createModalOverlay()

    try {
      const offerings = await purchasesRef.current.getOfferings()
      const offering = offerings.all['web_full_access']

      if (!offering) {
        console.error('RevenueCat: "Full Access" offering not found')
        overlay.remove()
        return
      }

      await purchasesRef.current.presentPaywall({
        htmlTarget: container,
        offering,
      })
      queryClient.invalidateQueries({ queryKey: [USER_QUERY] })
    } catch (e) {
      console.error('RevenueCat paywall error', e)
    } finally {
      overlay.remove()
    }
  }, [user, queryClient])

  return { isSubscribed, openUpgrade }
}
