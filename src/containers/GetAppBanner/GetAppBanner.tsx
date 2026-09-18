import { useEffect, useState } from 'react'
import { Smartphone, X } from 'lucide-react'

import { Button } from '@/components/ui'
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/consts'
import { Mixpanel } from '@/lib/mixpanel'

const DISMISS_KEY = 'packstack.getAppBanner.dismissedAt'
const DISMISS_FOR_MS = 30 * 24 * 60 * 60 * 1000

type Platform = 'ios' | 'android'

/**
 * Which store to point at, or null when the bar should not show at all.
 *
 * Shows only on phone-sized iOS/Android browsers. iOS *Safari* is excluded
 * because index.html carries an `apple-itunes-app` meta tag and Safari renders
 * its own native Smart App Banner there — showing both would double up.
 * Chrome/Firefox/Edge on iOS ignore that meta tag, so they get this bar.
 */
function detectPlatform(): Platform | null {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return null
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPod/.test(ua) || (/iPad/.test(ua) && 'ontouchend' in document)
  const isAndroid = /Android/.test(ua) && /Mobile/.test(ua)
  if (!isIOS && !isAndroid) return null
  if (window.matchMedia('(min-width: 768px)').matches) return null // tablets keep the web app
  if (isIOS) {
    const otherIOSBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/.test(ua)
    const isSafari = /Safari/.test(ua) && !otherIOSBrowser
    return isSafari ? null : 'ios'
  }
  return 'android'
}

function recentlyDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY)
    return raw !== null && Date.now() - Number(raw) < DISMISS_FOR_MS
  } catch {
    return false
  }
}

/**
 * Slim "Get the app" bar for signed-in users on a phone browser. The web app is
 * laid out for desktop; the mobile app is the intended surface on a phone.
 * Dismissal is remembered for 30 days per browser.
 */
export const GetAppBanner = () => {
  const [platform, setPlatform] = useState<Platform | null>(null)

  useEffect(() => {
    const detected = detectPlatform()
    if (detected && !recentlyDismissed()) {
      setPlatform(detected)
      Mixpanel.track('GetApp:Shown', { platform: detected })
    }
  }, [])

  if (!platform) return null

  const storeUrl = platform === 'ios' ? APP_STORE_URL : PLAY_STORE_URL

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // Private mode or blocked storage: the bar simply comes back next load.
    }
    Mixpanel.track('GetApp:Dismiss', { platform })
    setPlatform(null)
  }

  const open = () => {
    Mixpanel.track('GetApp:Click', { platform })
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-primary text-primary-foreground text-sm">
      <Smartphone size={18} className="shrink-0" />
      <div className="flex-1 min-w-0 leading-tight">
        <div className="font-semibold">Packstack is better in the app</div>
        <div className="text-xs opacity-80">Offline packs, quick add, share cards.</div>
      </div>
      <Button asChild size="sm" variant="secondary" className="shrink-0">
        <a href={storeUrl} target="_blank" rel="noopener noreferrer" onClick={open}>
          Get the app
        </a>
      </Button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 p-1 rounded-md opacity-70 hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  )
}
