import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from '@tanstack/react-router'

import { Button, Input } from '@/components/ui'
import { Mixpanel } from '@/lib/mixpanel'
import { handleException } from '@/lib/utils'
import { useUserLogin } from '@/queries/user'

type LoginForm = {
  emailOrUsername: string
  password: string
}

export const Login = () => {
  const { register, handleSubmit } = useForm<LoginForm>()
  const [error, setError] = useState<string | undefined>()
  const navigate = useNavigate()
  const login = useUserLogin()

  const onSubmit = (data: LoginForm) => {
    login.mutate(data, {
      onSuccess: ({ user }) => {
        Mixpanel.identify(`${user.id}`)
        Mixpanel.track('User:Login')
        Mixpanel.people.set({
          $name: user.username,
          $email: user.email,
        })
        navigate({ to: '/' })
      },
      onError: error => {
        handleException(error, {
          onHttpError: ({ response }) => setError(response?.data.detail),
        })
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Welcome back</h1>
      <p className="text-sm mt-1 mb-4">Sign in to your account</p>
      {error && (
        <p className="text-destructive-foreground bg-destructive/20 text-xs rounded-md px-3 py-2 mb-3">
          {error}
        </p>
      )}
      <div className="space-y-1">
        <label>Email or username</label>
        <Input
          {...register('emailOrUsername', { required: true })}
          placeholder="Email or username"
          tabIndex={1}
        />
      </div>
      <div className="space-y-1 mt-3">
        <div className="flex justify-between items-baseline">
          <label>Password</label>
          <Link
            to="/auth/request-password-reset"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            tabIndex={4}
          >
            Forgot password?
          </Link>
        </div>
        <Input
          {...register('password', { required: true })}
          type="password"
          placeholder="••••••"
          tabIndex={2}
        />
      </div>
      <Button
        type="submit"
        className="w-full mt-6"
        disabled={login.isPending}
        tabIndex={3}
      >
        Login
      </Button>
      <p className="text-xs text-center text-muted-foreground mt-4">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  )
}
