import { createFileRoute } from '@tanstack/react-router'
import { Helmet } from 'react-helmet-async'

import { Register } from '@/pages/Register'

const CANONICAL = 'https://app.packstack.io/auth/register'

function RegisterRoute() {
  return (
    <>
      <Helmet>
        <title>Create an Account | Packstack</title>
        <meta
          name="description"
          content="Sign up for Packstack to organize your backpacking gear, build packing lists, and track pack weight."
        />
        <link rel="canonical" href={CANONICAL} />
      </Helmet>
      <Register />
    </>
  )
}

export const Route = createFileRoute('/auth/register')({
  component: RegisterRoute,
})