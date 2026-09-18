import { useCallback } from 'react'
import { ErrorCode, Purchases, PurchasesError } from '@revenuecat/purchases-js'
import { useQueryClient } from '@tanstack/react-query'

import { useUser } from '@/hooks/useUser'
import { Mixpanel } from '@/lib/mixpanel'
import { ENTITLEMENT_ID, FALLBACK_OFFERING_ID } from '@/lib/consts'
import { useRevenueCat } from '@/providers/RevenueCatProvider'
import { USER_QUERY } from '@/queries/user'

/**
 * Where the paywall was opened from. Tracked on every open and on the
 * outcome so we can see which gate actually drives purchases. Mirrors the
 * mobile PaywallSource union in mobile/src/hooks/useUpgrade.ts.
 */
export type PaywallSource =
  | 'trip_limit'
  | 'trip_clone_limit'
  | 'pack_limit'
  | 'kit_limit'
  | 'calorie_estimate'
  | 'header'
  | 'settings'
  | 'connect_authorize'

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

  const openUpgrade = useCallback(async (source: PaywallSource) => {
    if (!Purchases.isConfigured()) return
    Mixpanel.track('Paywall:Open', { source })
    try {
      const purchases = Purchases.getSharedInstance()
      const offerings = await purchases.getOfferings()
      // Dashboard-driven: the current (default) offering wins, so swapping
      // offerings in RevenueCat takes effect without a deploy.
      await purchases.presentPaywall({
        offering:
          offerings.current ?? offerings.all[FALLBACK_OFFERING_ID] ?? undefined,
      })
      await refresh()
      await queryClient.invalidateQueries({ queryKey: [USER_QUERY] })
      Mixpanel.track('Paywall:Purchase', { source })
    } catch (e) {
      if (e instanceof PurchasesError && e.errorCode === ErrorCode.UserCancelledError) {
        Mixpanel.track('Paywall:Dismiss', { source })
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
