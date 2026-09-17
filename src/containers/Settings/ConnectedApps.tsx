import { useState } from 'react'
import { format } from 'date-fns'
import { Link2, Unplug } from 'lucide-react'

import { Button } from '@/components/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { Loading } from '@/components/ui/Loading'
import { useOAuthGrants, useRevokeOAuthGrant } from '@/queries/oauth'
import { OAuthGrant } from '@/types/oauth'

const DOCS_URL = 'https://packstack.io/developers/mcp'

const SCOPE_LABEL: Record<string, string> = {
  'packstack:read': 'Read',
  'packstack:write': 'Read & edit',
}

/**
 * AI assistants and other apps connected through the MCP connector. Each row
 * is an OAuth grant; disconnecting revokes every token behind it immediately.
 */
export const ConnectedApps = () => {
  const grants = useOAuthGrants()
  const revoke = useRevokeOAuthGrant()
  const [pending, setPending] = useState<OAuthGrant | null>(null)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Connected apps
        </h3>
        <a href={DOCS_URL} target="_blank" rel="noreferrer" className="link text-xs">
          How to connect an AI assistant
        </a>
      </div>

      {grants.isPending ? (
        <Loading />
      ) : grants.isError ? (
        <p className="text-sm text-muted-foreground">Couldn't load connected apps.</p>
      ) : grants.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No apps are connected. Connect Claude, ChatGPT or another AI assistant to
          plan trips and review gear with your real data.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
          {grants.data.map(g => (
            <li key={g.id} className="flex items-center gap-3 px-3 py-3">
              {g.client.logo_uri ? (
                <img src={g.client.logo_uri} alt="" className="size-8 rounded bg-white object-contain p-0.5" />
              ) : (
                <div className="size-8 rounded bg-muted flex items-center justify-center">
                  <Link2 className="size-4 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{g.client.name}</p>
                <p className="text-xs text-muted-foreground">
                  {g.scopes.includes('packstack:write') ? SCOPE_LABEL['packstack:write'] : SCOPE_LABEL['packstack:read']}
                  {' · '}connected {format(new Date(g.created_at), 'MMM d, yyyy')}
                  {g.last_used_at && <> · last used {format(new Date(g.last_used_at), 'MMM d')}</>}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPending(g)} disabled={revoke.isPending}>
                <Unplug className="size-4" />
                Disconnect
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={!!pending} onOpenChange={open => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {pending?.client.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              It will lose access to your Packstack account immediately. You can connect it
              again later from the app itself.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) revoke.mutate(pending.id)
                setPending(null)
              }}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
