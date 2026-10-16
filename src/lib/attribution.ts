/**
 * Ad attribution: which ad click (or UTM-tagged link) brought this visitor.
 *
 * packstack.io stores it in a `ps_attr` cookie on .packstack.io and adds the
 * same params to links into this app (see public/src/layouts/BaseLayout.astro).
 * Ads that land here directly put them on our own URL. Either way it's kept in
 * localStorage until the visitor registers, sent with the registration, and
 * stored on the user by the API, which reports the sign-up -- and later the
 * purchase -- to Google Ads (api/app/utils/ad_conversions.py).
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
  const best = pick(pick(readStored(), readCookie()), fromUrl())
  if (!best) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(best))
  } catch {
    // Private mode / storage blocked: the cookie or URL still works this session.
  }
}

/** What to send with a registration, if anything. */
export function getAttribution(): Attribution | undefined {
  return pick(readStored(), readCookie()) ?? undefined
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
