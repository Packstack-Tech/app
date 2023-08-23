import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userLogin, getUser } from "@/lib/api"
import { LoginRequest } from "@/types/api"
import { getCurrency } from "@/lib/currencies"

export const USER_QUERY = "user"
export const useUserQuery = () => {
  return useQuery({
    queryKey: [USER_QUERY],
    queryFn: async () => {
      const res = await getUser()
      return res.data
    },
    select: (data) => {
      const trips = [...data.trips]
      trips.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      return { ...data, currency: getCurrency(data.currency), trips }
    },
    retry: false,
    enabled: !!localStorage.getItem("jwt"),
  })
}

// export const PROFILE_QUERY = 'profile'
// export const useUserProfile = (username: string, initialData?: User) => {
//   return useQuery(
//     [PROFILE_QUERY, username],
//     async () => {
//       const res = await getProfile(username)
//       return res.data
//     },
//     {
//       initialData
//     }
//   )
// }

export const useUserLogin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: LoginRequest) => {
      const res = await userLogin(params)
      localStorage.setItem("jwt", res.data.token)
      queryClient.setQueryData([USER_QUERY], res.data.user)
      return res.data
    },
  })
}

// export const useUserRegister = () => {
//   const queryClient = useQueryClient()
//   return useMutation(async (params: RegisterRequest) => {
//     const res = await userRegister(params)
//     localStorage.setItem('jwt', res.data.token)
//     queryClient.setQueryData(USER_QUERY, res.data.user)
//     return res.data
//   })
// }

// export const useUploadAvatar = () => {
//   const queryClient = useQueryClient()
//   return useMutation(async (params: UploadAvatar) => {
//     const res = await uploadUserAvatar(params)
//     queryClient.setQueryData(USER_QUERY, res.data)
//     return res.data
//   })
// }

// export const useUpdateUser = () => {
//   const queryClient = useQueryClient()
//   return useMutation(
//     async (params: UpdateUser) => {
//       const res = await updateUser(params)
//       queryClient.setQueryData(USER_QUERY, res.data)
//       return res.data
//     },
//     {
//       onSuccess: () => {
//         queryClient.invalidateQueries([PROFILE_QUERY])
//       }
//     }
//   )
// }
