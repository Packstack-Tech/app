import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { type CustomerInfo, Purchases } from '@revenuecat/purchases-js'

import { useUserQuery } from '@/queries/user'

type RevenueCatContextValue = {
  isReady: boolean
  customerInfo: CustomerInfo | null
  refresh: () => Promise<void>
}

const RevenueCatContext = createContext<RevenueCatContextValue>({
  isReady: false,
  customerInfo: null,
  refresh: async () => {},
})

const API_KEY = import.meta.env.VITE_REVENUECAT_WEB_API_KEY as string | undefined

export const RevenueCatProvider: FC<PropsWithChildren> = ({ children }) => {
  const { data: user } = useUserQuery()
  const [isReady, setIsReady] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)

  useEffect(() => {
    if (!API_KEY || !user?.id) return

    // Match the app_user_id the RevenueCat webhook expects (int user id).
    const appUserId = String(user.id)

    const init = async () => {
      try {
        if (!Purchases.isConfigured()) {
          Purchases.configure({ apiKey: API_KEY, appUserId })
        } else if (Purchases.getSharedInstance().getAppUserId() !== appUserId) {
          await Purchases.getSharedInstance().changeUser(appUserId)
        }
        setIsReady(true)
        const info = await Purchases.getSharedInstance().getCustomerInfo()
        setCustomerInfo(info)
      } catch {
        // Subscription state falls back to the server-authoritative
        // user.is_subscribed, so a failure here is non-fatal.
      }
    }

    init()
  }, [user?.id])

  const refresh = useCallback(async () => {
    if (!Purchases.isConfigured()) return
    try {
      const info = await Purchases.getSharedInstance().getCustomerInfo()
      setCustomerInfo(info)
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo(
    () => ({ isReady, customerInfo, refresh }),
    [isReady, customerInfo, refresh]
  )

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  )
}

export const useRevenueCat = () => useContext(RevenueCatContext)
