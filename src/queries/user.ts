import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useToast } from '@/hooks/useToast'
import {
  getUser,
  requestPasswordReset,
  resetPassword,
  updateUser,
  userLogin,
  userRegister,
} from '@/lib/api'
import { getCurrency } from '@/lib/currencies'
import { Mixpanel } from '@/lib/mixpanel'
import { getConversionUnit } from '@/lib/weight'
import {
  LoginRequest,
  PasswordReset,
  RegisterRequest,
  UpdateUser,
} from '@/types/api'

export const USER_QUERY = 'user'
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
    select: data => {
      const trips = [...data.trips]
      trips.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      const conversion_unit = getConversionUnit(data.unit_weight)
      return {
        ...data,
        currency: getCurrency(data.currency),
        trips,
        conversion_unit,
      }
    },
    retry: false,
    enabled: !!localStorage.getItem('jwt'),
  })
}

export const useUserLogin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: LoginRequest) => {
      const res = await userLogin(params)
      localStorage.setItem('jwt', res.data.token)
      queryClient.setQueryData([USER_QUERY], res.data.user)
      return res.data
    },
  })
}

export const useUserRegister = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: RegisterRequest) => {
      const res = await userRegister(params)
      localStorage.setItem('jwt', res.data.token)
      queryClient.setQueryData([USER_QUERY], res.data.user)
      return res.data
    },
  })
}

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await requestPasswordReset(email)
      return res.data
    },
  })
}

export const useResetPassword = () => {
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (params: PasswordReset) => {
      const res = await resetPassword(params)
      return res.data
    },
    onSuccess: () => {
      toast({
        title: 'Password reset',
        description: 'Your password has been reset. Please log in.',
      })
    },
  })
}

// export const useUploadAvatar = () => {
//   const queryClient = useQueryClient()
//   return useMutation(async (params: UploadAvatar) => {
//     const res = await uploadUserAvatar(params)
//     queryClient.setQueryData(USER_QUERY, res.data)
//     return res.data
//   })
// }

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (params: UpdateUser) => {
      const res = await updateUser(params)
      // queryClient.setQueryData(USER_QUERY, res.data)
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
