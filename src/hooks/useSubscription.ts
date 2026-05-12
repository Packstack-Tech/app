export function useSubscription() {
  return { isSubscribed: true as const, openUpgrade: () => { }, managementUrl: null }
}
