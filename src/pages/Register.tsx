import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'

import { Button, Input } from '@/components/ui'
import { handleException } from '@/lib/utils'
import { useUserRegister } from '@/queries/user'

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
  const navigate = useNavigate()
  const signUp = useUserRegister()

  const onSubmit = (data: RegisterForm) => {
    setError(undefined)
    signUp.mutate(data, {
      onSuccess: () => navigate({ to: '/' }),
      onError: error => {
        handleException(error, {
          onHttpError: ({ response }) => setError(response?.data.detail),
        })
      },
    })
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
      <p className="text-xs text-center text-muted-foreground mt-4">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </form>
  )
}
