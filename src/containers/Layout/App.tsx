import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { useUserQuery } from "@/queries/user"
import { Header } from "@/containers/Header"

export const AppLayout = () => {
  const navigate = useNavigate()
  const { isLoading, isError } = useUserQuery()
  const jwt = localStorage.getItem("jwt")

  useEffect(() => {
    if (!jwt || isError) {
      navigate("/auth/login")
    }
  }, [jwt, isError, navigate])

  if (isLoading || !jwt) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Header />
      <Outlet />
    </div>
  )
}
