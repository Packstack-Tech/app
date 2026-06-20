import { useCallback } from 'react'
import { ErrorCode, Purchases, PurchasesError } from '@revenuecat/purchases-js'
import { useQueryClient } from '@tanstack/react-query'

import { useUser } from '@/hooks/useUser'
import { ENTITLEMENT_ID } from '@/lib/consts'
import { useRevenueCat } from '@/providers/RevenueCatProvider'
import { USER_QUERY } from '@/queries/user'

export function useSubscription() {
  const user = useUser()
  const queryClient = useQueryClient()
  const { customerInfo, refresh } = useRevenueCat()

  // user.is_subscribed is the server-authoritative source (synced by the
  // RevenueCat webhook); customerInfo is a faster local signal after a
  // purchase completes in this session.
  const isSubscribed =
    Boolean(user?.is_subscribed) ||
    Boolean(customerInfo?.entitlements.active[ENTITLEMENT_ID])

  const openUpgrade = useCallback(async () => {
    if (!Purchases.isConfigured()) return
    try {
      const purchases = Purchases.getSharedInstance()
      const offerings = await purchases.getOfferings()
      await purchases.presentPaywall({
        offering: offerings.current ?? undefined,
      })
      await refresh()
      await queryClient.invalidateQueries({ queryKey: [USER_QUERY] })
    } catch (e) {
      if (e instanceof PurchasesError && e.errorCode === ErrorCode.UserCancelledError) {
        return
      }
      // The RevenueCat paywall surfaces purchase errors in its own UI; log
      // for diagnostics without producing an unhandled rejection.
      console.error('Upgrade flow failed', e)
    }
  }, [queryClient, refresh])

  const managementUrl = customerInfo?.managementURL ?? null

  return { isSubscribed, openUpgrade, managementUrl }
}
