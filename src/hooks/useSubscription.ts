import { useCallback } from 'react'
import { ErrorCode, Purchases, PurchasesError } from '@revenuecat/purchases-js'
import { useQueryClient } from '@tanstack/react-query'

import { useUser } from '@/hooks/useUser'
import { Mixpanel } from '@/lib/mixpanel'
import { ENTITLEMENT_ID, FALLBACK_OFFERING_ID, PAYWALL_OFFERING_ID } from '@/lib/consts'
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
  /** The client let the action through but the API answered 402. */
  | 'server_402'

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
      // tiered_offerings first; if it has nothing purchasable on the web
      // (e.g. no Web Billing products attached), fall back to the dashboard's
      // current offering, then the old web offering, rather than an empty
      // paywall.
      const offering = [
        offerings.all[PAYWALL_OFFERING_ID],
        offerings.current,
        offerings.all[FALLBACK_OFFERING_ID],
      ].find(o => o && o.availablePackages.length > 0)
      if (offering && offering.identifier !== PAYWALL_OFFERING_ID) {
        Mixpanel.track('Paywall:OfferingFallback', {
          source,
          wanted: PAYWALL_OFFERING_ID,
          shown: offering.identifier,
        })
      }
      await purchases.presentPaywall({ offering: offering ?? undefined })
      await refresh()
      await queryClient.invalidateQueries({ queryKey: [USER_QUERY] })
      Mixpanel.track('Paywall:Purchase', { source, offering: offering?.identifier })
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
