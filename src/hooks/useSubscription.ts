import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [managementUrl, setManagementUrl] = useState<string | null>(null)

  const ensurePurchases = useCallback(() => {
    if (!RC_API_KEY || !user) return null
    if (!purchasesRef.current) {
      purchasesRef.current = Purchases.configure({ apiKey: RC_API_KEY, appUserId: String(user.id) })
    }
    return purchasesRef.current
  }, [user])

  useEffect(() => {
    if (!isSubscribed) {
      setManagementUrl(null)
      return
    }

    const purchases = ensurePurchases()
    if (!purchases) return

    let cancelled = false
    purchases.getCustomerInfo().then(info => {
      if (!cancelled) setManagementUrl(info.managementURL)
    }).catch(() => {})

    return () => { cancelled = true }
  }, [isSubscribed, ensurePurchases])

  const openUpgrade = useCallback(async () => {
    const purchases = ensurePurchases()
    if (!purchases) return

    const { overlay, container } = createModalOverlay()

    try {
      const offerings = await purchases.getOfferings()
      const offering = offerings.all['web_full_access']

      if (!offering) {
        console.error('RevenueCat: "Full Access" offering not found')
        overlay.remove()
        return
      }

      await purchases.presentPaywall({
        htmlTarget: container,
        offering,
      })
      queryClient.invalidateQueries({ queryKey: [USER_QUERY] })
    } catch (e) {
      console.error('RevenueCat paywall error', e)
    } finally {
      overlay.remove()
    }
  }, [ensurePurchases, queryClient])

  return { isSubscribed, openUpgrade, managementUrl }
}
