import { useEffect } from "react"
import { useUserQuery } from "@/queries/user"
import { Outlet, useNavigate } from "react-router-dom"
import { Header } from "@/containers/Header"
import { useInventory } from "@/queries/item"

export const AppLayout = () => {
  const navigate = useNavigate()
  const { isLoading, isSuccess, isError } = useUserQuery()
  useInventory(isSuccess)

  useEffect(() => {
    if (!localStorage.getItem("jwt") || isError) {
      navigate("/auth/login")
    }
  }, [isError, navigate])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Header />
      <Outlet />
    </div>
  )
}
