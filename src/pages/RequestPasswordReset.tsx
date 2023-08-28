import { useState } from "react"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { Button, Input } from "@/components/ui"
import { useRequestPasswordReset } from "@/queries/user"

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
    requestPasswordReset.mutate(email, {
      onSuccess: () => setSuccess(true),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Forgot Password?</h1>
      <p className="text-sm text-slate-200 mt-2">
        No worries. We'll send you instructions on how to reset your password.
      </p>
      {success && (
        <p className="text-secondary text-sm my-1">
          Check your inbox. You'll receive an email to reset your password if
          that email is registered.
        </p>
      )}
      <div className="my-2">
        <label>Email</label>
        <Input {...register("email", { required: true })} placeholder="Email" />
      </div>
      {errors.email && (
        <p className="text-xs text-red-300">Must be a valid email.</p>
      )}
      <div className="flex justify-end mt-4">
        <Button
          type="submit"
          className="w-full"
          disabled={success || requestPasswordReset.isPending}
        >
          Reset Password
        </Button>
      </div>
      <div className="mt-3">
        <p className="text-xs text-slate-200">
          Back to{" "}
          <Link to="/auth/register" className="text-primary underline">
            Login
          </Link>
        </p>
      </div>
    </form>
  )
}
