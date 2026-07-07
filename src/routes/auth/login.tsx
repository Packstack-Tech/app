import { createFileRoute } from '@tanstack/react-router'
import { Helmet } from 'react-helmet-async'

import { Login } from '@/pages/Login'

const CANONICAL = 'https://app.packstack.io/auth/login'

function LoginRoute() {
  return (
    <>
      <Helmet>
        <title>Log In | Packstack</title>
        <meta
          name="description"
          content="Log in to your Packstack account to manage your backpacking gear and plan trips."
        />
        <link rel="canonical" href={CANONICAL} />
      </Helmet>
      <Login />
    </>
  )
}

export const Route = createFileRoute('/auth/login')({
  component: LoginRoute,
})
