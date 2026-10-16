/**
 * Ad attribution: which ad click (or UTM-tagged link) brought this visitor.
 *
 * packstack.io stores it in a `ps_attr` cookie on .packstack.io and adds the
 * same params to links into this app (see public/src/layouts/BaseLayout.astro).
 * Ads that land here directly put them on our own URL. Either way it's kept in
 * localStorage until the visitor registers, sent with the registration, and
 * stored on the user by the API, which reports the sign-up -- and later the
 * purchase -- to Google Ads (api/app/utils/ad_conversions.py).
 *
 * Visitors in the EEA, UK and Switzerland are asked first: packstack.io shows a
 * consent banner and records the answer in a `ps_consent` cookie on
 * .packstack.io (and as `ps_consent` on links into the app). Without a "yes",
 * nothing is kept or sent for them.
 */

export type Attribution = {
  gclid?: string
  gbraid?: string
  wbraid?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  landing?: string
  /** When the click/landing happened, ms since epoch. */
  ts?: number
  /** Set when a visitor in the consent region accepted the banner. */
  consent?: 'granted'
}

const KEYS = [
  'gclid', 'gbraid', 'wbraid',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
] as const
const CLICK_IDS = ['gclid', 'gbraid', 'wbraid'] as const
const STORAGE_KEY = 'ps_attr'
const COOKIE = 'ps_attr'
// Google accepts click conversions up to 90 days after the click.
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000

// Same rule as the banner on packstack.io (public/src/layouts/BaseLayout.astro):
// every Europe/* time zone plus the EU/EEA ones elsewhere.
const CONSENT_ZONES = [
  'Asia/Nicosia', 'Asia/Famagusta', 'Atlantic/Reykjavik', 'Atlantic/Canary',
  'Atlantic/Madeira', 'Atlantic/Azores', 'Atlantic/Faroe', 'Arctic/Longyearbyen',
  'Indian/Reunion', 'Indian/Mayotte', 'America/Guadeloupe', 'America/Martinique',
  'America/Cayenne', 'America/Marigot',
]

function consentRequired(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    return tz.startsWith('Europe/') || CONSENT_ZONES.includes(tz)
  } catch {
    return false
  }
}

function consentCookie(): 'granted' | 'denied' | null {
  try {
    const match = document.cookie.match(/(?:^|; )ps_consent=(granted|denied)/)
    return match ? (match[1] as 'granted' | 'denied') : null
  } catch {
    return null
  }
}

/**
 * The record as it may be kept, or null when the visitor hasn't agreed: a
 * "no" on the banner always wins; in the consent region a "yes" is needed.
 */
function withConsent(a: Attribution | null): Attribution | null {
  if (!a) return null
  const cookie = consentCookie()
  if (cookie === 'denied') return null
  if (cookie === 'granted' || a.consent === 'granted') return { ...a, consent: 'granted' }
  return consentRequired() ? null : a
}

const hasClickId = (a?: Attribution | null) => !!a && CLICK_IDS.some(k => !!a[k])

const isFresh = (a?: Attribution | null): a is Attribution =>
  !!a && typeof a.ts === 'number' && Date.now() - a.ts < MAX_AGE_MS

function readStored(): Attribution | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Attribution) : null
    return isFresh(parsed) ? parsed : null
  } catch {
    return null
  }
}

function readCookie(): Attribution | null {
  try {
    const match = document.cookie.match(/(?:^|; )ps_attr=([^;]*)/)
    const parsed = match ? (JSON.parse(decodeURIComponent(match[1])) as Attribution) : null
    return isFresh(parsed) ? parsed : null
  } catch {
    return null
  }
}

function fromUrl(): Attribution | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const found: Attribution = {}
    for (const key of KEYS) {
      const value = params.get(key)
      if (value) found[key] = value.slice(0, 255)
    }
    if (!Object.keys(found).length) return null
    const ts = Number(params.get('ps_ts'))
    found.ts = Number.isFinite(ts) && ts > 0 && ts <= Date.now() ? ts : Date.now()
    found.landing = (params.get('ps_landing') || window.location.pathname).slice(0, 255)
    if (params.get('ps_consent') === 'granted') found.consent = 'granted'
    return found
  } catch {
    return null
  }
}

/**
 * A newer record wins, except that a visit with only UTM tags never replaces
 * one carrying an ad click id -- the click is what Google can credit.
 */
function pick(current: Attribution | null, incoming: Attribution | null): Attribution | null {
  if (!incoming) return current
  if (!current) return incoming
  if (hasClickId(current) && !hasClickId(incoming)) return current
  return (incoming.ts ?? 0) >= (current.ts ?? 0) ? incoming : current
}

/** Call once on startup. */
export function captureAttribution(): void {
  const best = withConsent(pick(pick(readStored(), readCookie()), fromUrl()))
  if (!best) {
    // Nothing, or a visitor who hasn't agreed (or has since said no).
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    return
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(best))
  } catch {
    // Private mode / storage blocked: the cookie or URL still works this session.
  }
}

/** What to send with a registration, if anything. */
export function getAttribution(): Attribution | undefined {
  return withConsent(pick(readStored(), readCookie())) ?? undefined
}

/** Mixpanel props describing where a new user came from. */
export function attributionProps(a?: Attribution) {
  if (!a) return {}
  return {
    utm_source: a.utm_source,
    utm_medium: a.utm_medium,
    utm_campaign: a.utm_campaign,
    ad_click: CLICK_IDS.find(k => !!a[k]) ?? null,
  }
}

/** After a successful registration: it's on the user now. */
export function clearAttribution(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  try {
    const domain = window.location.hostname.endsWith('packstack.io') ? '; domain=.packstack.io' : ''
    document.cookie = `${COOKIE}=; path=/; max-age=0${domain}`
  } catch {
    // ignore
  }
}
