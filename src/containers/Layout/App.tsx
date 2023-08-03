import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { useUserQuery } from "@/queries/user"
import { Header } from "@/containers/Header"

export const AppLayout = () => {
  const navigate = useNavigate()
  const { isLoading, isError } = useUserQuery()

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
