import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { Loading } from '@/components/ui/Loading'
import { Header } from '@/containers/Header'
import { useUserQuery } from '@/queries/user'

export const AppLayout = () => {
  const navigate = useNavigate()
  const { data, isError } = useUserQuery()
  const jwt = localStorage.getItem('jwt')

  useEffect(() => {
    if (!jwt || isError) {
      navigate('/auth/login')
    }
  }, [jwt, isError, navigate])

  if (data) {
    return (
      <div>
        <Header />
        <Outlet />
      </div>
    )
  }

  return (
    <div className="h-screen">
      <Loading />
    </div>
  )
}
