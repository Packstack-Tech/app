/** Shapes returned by the API's /oauth/* endpoints (MCP connector). */

export type OAuthScope = 'packstack:read' | 'packstack:write' | 'offline_access'

export type ConsentDetails = {
  request_id: string
  client: {
    name: string
    uri: string | null
    logo_uri: string | null
    kind: 'cimd' | 'dcr' | 'preregistered'
  }
  redirect_host: string | null
  loopback_only: boolean
  scopes: { scope: OAuthScope; title: string; detail: string }[]
  requests_write: boolean
  already_connected: boolean
  account: { username: string; is_subscribed: boolean }
  expires_at: string
}

export type ConsentDecision = {
  request_id: string
  approve: boolean
}

export type OAuthGrant = {
  id: number
  client: { name: string; uri: string | null; logo_uri: string | null }
  scopes: OAuthScope[]
  created_at: string
  last_used_at: string | null
}
