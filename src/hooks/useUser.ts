import { useUserQuery } from "@/queries/user"
import { UserInfo } from "@/types/user"

export const useUser = () => {
  const { data } = useUserQuery()
  return data as UserInfo
}
