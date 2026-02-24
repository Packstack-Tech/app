import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleLogin } from '@react-oauth/google'
import { Link, useNavigate } from '@tanstack/react-router'

import { Button, Input } from '@/components/ui'
import { Loading } from '@/components/ui/Loading'
import { Mixpanel } from '@/lib/mixpanel'
import { handleException } from '@/lib/utils'
import { useGoogleAuth, useResendVerification, useUserRegister } from '@/queries/user'

type RegisterForm = {
  username: string
  email: string
  password: string
}

const schema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must be at most 20 characters long')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers and underscores (_)'
    ),
  email: z.string().email(),
  password: z.string().min(6).max(50),
})

export const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    mode: 'onBlur',
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', password: '' },
  })
  const [error, setError] = useState<string | undefined>()
  const [registered, setRegistered] = useState(false)
  const navigate = useNavigate()
  const signUp = useUserRegister()
  const googleAuthMutation = useGoogleAuth()
  const resendVerification = useResendVerification()

  const onSubmit = (data: RegisterForm) => {
    setError(undefined)
    signUp.mutate(data, {
      onSuccess: () => setRegistered(true),
      onError: error => {
        handleException(error, {
          onHttpError: ({ response }) => setError(response?.data.detail),
        })
      },
    })
  }

  if (googleAuthMutation.isPending) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Loading size="sm" />
        <p className="text-sm text-muted-foreground">Signing you in...</p>
      </div>
    )
  }

  if (registered) {
    return (
      <div>
        <h1>Check your inbox</h1>
        <p className="text-sm mt-1 mb-4 text-muted-foreground">
          We sent a verification link to your email address. Click the link to
          verify your account.
        </p>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => resendVerification.mutate()}
          disabled={resendVerification.isPending}
        >
          Resend verification email
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-4">
          <Link to="/" className="text-primary hover:underline">
            Continue to app
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Create an account</h1>
      <p className="text-sm mt-1 mb-4">Create packing lists and organize your gear</p>
      {error && (
        <p className="text-destructive-foreground bg-destructive/20 text-xs rounded-md px-3 py-2 mb-3">
          {error}
        </p>
      )}
      <div className="space-y-1">
        <label>Username</label>
        <Input
          {...register('username', { required: true })}
          placeholder="username"
        />
        {errors.username?.message && (
          <p className="text-red-400 text-xs">{errors.username.message}</p>
        )}
      </div>
      <div className="space-y-1 mt-3">
        <label>Email</label>
        <Input
          {...register('email', { required: true })}
          placeholder="john@muir.com"
        />
        {errors.email?.message && (
          <p className="text-red-400 text-xs">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-1 mt-3">
        <label>Password</label>
        <Input
          {...register('password', { required: true })}
          type="password"
          placeholder="••••••"
        />
        {errors.password?.message && (
          <p className="text-red-400 text-xs">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full mt-6" disabled={signUp.isPending}>
        Sign Up
      </Button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={credentialResponse => {
            if (!credentialResponse.credential) return
            setError(undefined)
            googleAuthMutation.mutate(credentialResponse.credential, {
              onSuccess: ({ user }) => {
                Mixpanel.identify(`${user.id}`)
                Mixpanel.track('User:Register:Google')
                Mixpanel.people.set({
                  $name: user.username,
                  $email: user.email,
                })
                navigate({ to: '/' })
              },
              onError: error => {
                handleException(error, {
                  onHttpError: ({ response }) =>
                    setError(response?.data.detail),
                })
              },
            })
          }}
          onError={() => setError('Google sign-in failed. Please try again.')}
        />
      </div>

      <p className="text-xs text-center text-muted-foreground mt-4">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </form>
  )
}
