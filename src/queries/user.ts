import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { useToast } from '@/hooks/useToast'
import {
  getUser,
  googleAuth,
  resendVerificationEmail,
  sendOtp,
  updateUser,
  verifyEmail,
  verifyOtp,
} from '@/lib/api'
import { getCurrency } from '@/lib/currencies'
import { Mixpanel } from '@/lib/mixpanel'
import { getConversionUnit } from '@/lib/weight'
import { SendOtpRequest, UpdateUser, VerifyOtpRequest } from '@/types/api'

export const USER_QUERY = 'user'

export const userQueryOptions = queryOptions({
  queryKey: [USER_QUERY],
  queryFn: async () => {
    const res = await getUser()
    Mixpanel.identify(`${res.data.id}`)
    Mixpanel.people.set({
      $name: res.data.username,
      $email: res.data.email,
    })
    return res.data
  },
  retry: false,
})

export const useUserQuery = () => {
  return useQuery({
    queryKey: [USER_QUERY],
    queryFn: async () => {
      const res = await getUser()
      Mixpanel.identify(`${res.data.id}`)
      Mixpanel.people.set({
        $name: res.data.username,
        $email: res.data.email,
      })
      return res.data
    },
    select: data => ({
      ...data,
      currency: getCurrency(data.currency),
      conversion_unit: getConversionUnit(data.unit_weight),
    }),
    retry: false,
  })
}

export const useSendOtp = () => {
  return useMutation({
    mutationFn: async (params: SendOtpRequest) => {
      const res = await sendOtp(params)
      return res.data
    },
  })
}

export const useVerifyOtp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: VerifyOtpRequest) => {
      const res = await verifyOtp(params)
      queryClient.setQueryData([USER_QUERY], res.data.user)
      return res.data
    },
  })
}

export const useGoogleAuth = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (credential: string) => {
      const res = await googleAuth(credential)
      queryClient.setQueryData([USER_QUERY], res.data.user)
      return res.data
    },
  })
}

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (callbackId: string) => {
      const res = await verifyEmail(callbackId)
      return res.data
    },
  })
}

export const useResendVerification = () => {
  const { toast } = useToast()
  return useMutation({
    mutationFn: async () => {
      const res = await resendVerificationEmail()
      return res.data
    },
    onSuccess: () => {
      toast({
        title: 'Verification email sent',
        description: 'Check your inbox for the verification link.',
      })
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (params: UpdateUser) => {
      const res = await updateUser(params)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY] })
      toast({
        title: '✅ Settings updated',
      })
    },
  })
}
