import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'

import { Button, Input } from '@/components/ui'
import { useRequestPasswordReset } from '@/queries/user'

type RequestPasswordResetForm = {
  email: string
}

const schema = z.object({
  email: z.string().email(),
})

export const RequestPasswordReset = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestPasswordResetForm>({
    resolver: zodResolver(schema),
  })
  const [success, setSuccess] = useState<boolean>(false)
  const requestPasswordReset = useRequestPasswordReset()

  const onSubmit = ({ email }: RequestPasswordResetForm) => {
    console.log(email)
    requestPasswordReset.mutate(email, {
      onSuccess: () => setSuccess(true),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Forgot Password?</h1>
      <p className="text-sm mt-1 mb-4">
        No worries. We'll send you instructions on how to reset your password.
      </p>
      {success && (
        <p className="text-secondary bg-secondary/10 text-sm rounded-md px-3 py-2 mb-3">
          Check your inbox. You'll receive an email to reset your password if
          that email is registered.
        </p>
      )}
      <div className="space-y-1">
        <label>Email</label>
        <Input {...register('email', { required: true })} placeholder="Email" />
        {errors.email && (
          <p className="text-red-400 text-xs">Must be a valid email.</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full mt-6"
        disabled={success || requestPasswordReset.isPending}
      >
        Send Reset Link
      </Button>
      <p className="text-xs text-center text-muted-foreground mt-4">
        Back to{' '}
        <Link to="/auth/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </form>
  )
}
