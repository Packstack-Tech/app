import { useEffect, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'

import { Button } from '@/components/ui'
import { useVerifyEmail } from '@/queries/user'

export const VerifyEmail = () => {
  const { callbackId } = useParams({
    from: '/auth/verify-email/$callbackId',
  })
  const verifyEmail = useVerifyEmail()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )

  useEffect(() => {
    verifyEmail.mutate(callbackId, {
      onSuccess: () => setStatus('success'),
      onError: () => setStatus('error'),
    })
  }, [callbackId])

  if (status === 'loading') {
    return (
      <div>
        <h1>Verifying your email...</h1>
        <p className="text-sm mt-1 text-muted-foreground">
          Please wait while we verify your email address.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div>
        <h1>Verification failed</h1>
        <p className="text-sm mt-1 mb-4 text-muted-foreground">
          This verification link is invalid or has expired.
        </p>
        <Link to="/auth/login">
          <Button className="w-full">Go to Login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1>Email verified</h1>
      <p className="text-sm mt-1 mb-4 text-muted-foreground">
        Your email address has been verified. You're all set!
      </p>
      <Link to="/">
        <Button className="w-full">Continue</Button>
      </Link>
    </div>
  )
}
