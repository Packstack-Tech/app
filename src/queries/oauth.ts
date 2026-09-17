import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { useToast } from '@/hooks/useToast'
import {
  decideConsent,
  getConsentDetails,
  getOAuthGrants,
  revokeOAuthGrant,
} from '@/lib/api'
import { Mixpanel } from '@/lib/mixpanel'
import { ConsentDecision } from '@/types/oauth'

export const OAUTH_GRANTS_QUERY = ['oauth-grants-query']

export const consentDetailsQueryOptions = (requestId: string) =>
  queryOptions({
    queryKey: ['oauth-consent', requestId],
    queryFn: async () => {
      const res = await getConsentDetails(requestId)
      return res.data
    },
    retry: false,
    staleTime: Infinity,
  })

export const useDecideConsent = () =>
  useMutation({
    mutationFn: async (data: ConsentDecision) => {
      const res = await decideConsent(data)
      return res.data
    },
  })

export const useOAuthGrants = () =>
  useQuery({
    queryKey: OAUTH_GRANTS_QUERY,
    queryFn: async () => {
      const res = await getOAuthGrants()
      return res.data
    },
  })

export const useRevokeOAuthGrant = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (grantId: number) => {
      await revokeOAuthGrant(grantId)
      Mixpanel.track('MCP:Connection revoked')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OAUTH_GRANTS_QUERY })
      toast({ title: 'Disconnected', duration: 2000 })
    },
    onError: () => {
      toast({ title: "Couldn't disconnect. Please try again.", duration: 3000 })
    },
  })
}
