import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

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
  const { callback_id } = useParams()
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
      { password, callback_id: callback_id as string },
      {
        onSuccess: () => navigate('/auth/login'),
      }
    )
  }

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Reset Password</h1>
      <div className="my-2">
        <label>Password</label>
        <Input
          {...register('password', { required: true })}
          type="password"
          placeholder="••••••"
        />
      </div>
      {errors.password && (
        <p className="text-xs text-red-300">{errors.password?.message}</p>
      )}
      <div className="my-2">
        <label>Confirm password</label>
        <Input
          {...register('confirmPassword', { required: true })}
          type="password"
          placeholder="••••••"
        />
      </div>
      {password !== confirmPassword && (
        <p className="text-xs text-red-300">Passwords do not match</p>
      )}
      <div className="flex justify-end mt-4">
        <Button
          type="submit"
          className="w-full"
          disabled={resetPassword.isPending}
        >
          Reset Password
        </Button>
      </div>
    </form>
  )
}
