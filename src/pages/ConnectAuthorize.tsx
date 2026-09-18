import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { AlertTriangle, Check, Link2, ShieldCheck } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import logo from '/packstack_logo_white.png'
import { Box, Button } from '@/components/ui'
import { Loading } from '@/components/ui/Loading'
import { useSubscription } from '@/hooks/useSubscription'
import { Mixpanel } from '@/lib/mixpanel'
import { consentDetailsQueryOptions, useDecideConsent } from '@/queries/oauth'

interface Props {
  requestId: string | undefined
}

/**
 * OAuth consent screen for the MCP connector.
 *
 * The API's /oauth/authorize endpoint has already validated the client, its
 * redirect URI, PKCE and resource before sending the browser here; this page
 * only shows who is asking and for what, then posts the decision. The API
 * answers with the client's callback URL and we hand the browser to it.
 */
export const ConnectAuthorize = ({ requestId }: Props) => {
  const details = useQuery({
    ...consentDetailsQueryOptions(requestId ?? ''),
    enabled: !!requestId,
  })
  const decide = useDecideConsent()
  const { openUpgrade } = useSubscription()
  const [submitting, setSubmitting] = useState<'approve' | 'deny' | null>(null)

  useEffect(() => {
    if (details.data) {
      Mixpanel.track('MCP:Consent viewed', {
        client: details.data.client.name,
        requests_write: details.data.requests_write,
        already_connected: details.data.already_connected,
      })
    }
  }, [details.data])

  const submit = (approve: boolean) => {
    if (!details.data) return
    setSubmitting(approve ? 'approve' : 'deny')
    decide.mutate(
      { request_id: details.data.request_id, approve },
      {
        onSuccess: ({ redirect_to }) => {
          Mixpanel.track(approve ? 'MCP:Consent approved' : 'MCP:Consent denied', {
            client: details.data?.client.name,
            requests_write: details.data?.requests_write,
          })
          window.location.assign(redirect_to)
        },
        onError: () => setSubmitting(null),
      }
    )
  }

  let body: React.ReactNode

  if (!requestId) {
    body = <Problem title="Nothing to authorize">Open this page from your AI assistant's connect flow.</Problem>
  } else if (details.isPending) {
    body = <div className="py-10 flex justify-center"><Loading /></div>
  } else if (details.isError) {
    const status = isAxiosError(details.error) ? details.error.response?.status : undefined
    const detail = isAxiosError(details.error) ? details.error.response?.data?.detail : undefined
    body = (
      <Problem title={status === 410 || status === 404 ? 'This request has expired' : "Couldn't load this request"}>
        {detail || 'Go back to your AI assistant and start the connection again.'}
      </Problem>
    )
  } else {
    const d = details.data
    const showUpgradeNote = d.requests_write && !d.account.is_subscribed
    body = (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          {d.client.logo_uri ? (
            <img src={d.client.logo_uri} alt="" className="size-12 rounded-lg bg-white object-contain p-1" />
          ) : (
            <div className="size-12 rounded-lg bg-muted flex items-center justify-center">
              <Link2 className="size-6 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-tight truncate">
              {d.client.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              wants to connect to your Packstack account
              {d.already_connected ? ' (already connected — this updates its access)' : ''}
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {d.scopes.map(s => (
            <li key={s.scope} className="flex gap-3">
              <ShieldCheck className="size-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium leading-tight">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
              </div>
            </li>
          ))}
        </ul>

        {showUpgradeNote && (
          <Note>
            Making changes through a connected app requires a Packstack subscription. You can
            allow the connection now — reading will work right away, and edits will ask you to{' '}
            <button type="button" className="link" onClick={() => openUpgrade('connect_authorize')}>upgrade</button>.
          </Note>
        )}

        {d.loopback_only && (
          <Note warning>
            This app runs on your own computer and will receive access at{' '}
            <code>{d.redirect_host}</code>. Only continue if you started this from software you trust.
          </Note>
        )}

        <div className="text-xs text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{d.account.username}</span>.
          {d.redirect_host && !d.loopback_only && (
            <> After you allow, you'll return to <span className="font-medium text-foreground">{d.redirect_host}</span>.</>
          )}{' '}
          You can disconnect any time in Settings → Connected apps.
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => submit(false)} disabled={!!submitting}>
            {submitting === 'deny' ? 'Cancelling…' : 'Cancel'}
          </Button>
          <Button onClick={() => submit(true)} disabled={!!submitting}>
            <Check className="size-4" />
            {submitting === 'approve' ? 'Connecting…' : 'Allow'}
          </Button>
        </div>
        {decide.isError && (
          <p className="text-xs text-destructive">Something went wrong. Please try again.</p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Packstack" className="w-36 invert dark:invert-0" />
        </div>
        <Box className="px-8 py-6">{body}</Box>
      </div>
    </div>
  )
}

const Problem = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-2 py-4 text-center">
    <AlertTriangle className="size-8 mx-auto text-muted-foreground" />
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-sm text-muted-foreground">{children}</p>
  </div>
)

const Note = ({ children, warning = false }: { children: React.ReactNode; warning?: boolean }) => (
  <div
    className={`rounded-md border px-3 py-2.5 text-xs leading-relaxed ${
      warning ? 'border-amber-500/40 bg-amber-500/10' : 'border-border bg-muted/40'
    }`}
  >
    {children}
  </div>
)
