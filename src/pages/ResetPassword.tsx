import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from '@tanstack/react-router'

import { Button, Input } from '@/components/ui'
import { useResetPassword } from '@/queries/user'

type PasswordResetForm = {
  password: string
  confirmPassword: string
}

const schema = z.object({
  password: z.string().min(6).max(50),
  confirmPassword: z.string().min(6).max(50),
})

export const ResetPassword = () => {
  const navigate = useNavigate()
  const { callbackId } = useParams({ from: '/auth/reset-password/$callbackId' })
  const resetPassword = useResetPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PasswordResetForm>({
    mode: 'onBlur',
    resolver: zodResolver(schema),
  })

  const onSubmit = ({ password }: PasswordResetForm) => {
    resetPassword.mutate(
      { password, callback_id: callbackId },
      {
        onSuccess: () => navigate({ to: '/auth/login' }),
      }
    )
  }

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Reset Password</h1>
      <p className="text-sm mt-1 mb-4">Choose a new password for your account</p>
      <div className="space-y-1">
        <label>Password</label>
        <Input
          {...register('password', { required: true })}
          type="password"
          placeholder="••••••"
        />
        {errors.password && (
          <p className="text-red-400 text-xs">{errors.password?.message}</p>
        )}
      </div>
      <div className="space-y-1 mt-3">
        <label>Confirm password</label>
        <Input
          {...register('confirmPassword', { required: true })}
          type="password"
          placeholder="••••••"
        />
        {password && confirmPassword && password !== confirmPassword && (
          <p className="text-red-400 text-xs">Passwords do not match</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full mt-6"
        disabled={resetPassword.isPending}
      >
        Reset Password
      </Button>
    </form>
  )
}
