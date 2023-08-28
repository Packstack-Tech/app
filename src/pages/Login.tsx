import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { Button, Input } from "@/components/ui"
import { useUserLogin } from "@/queries/user"
import { handleException } from "@/lib/utils"

type LoginForm = {
  emailOrUsername: string
  password: string
}

export const LoginPage = () => {
  const { register, handleSubmit } = useForm<LoginForm>()
  const [error, setError] = useState<string | undefined>()
  const navigate = useNavigate()
  const login = useUserLogin()

  const onSubmit = (data: LoginForm) => {
    login.mutate(data, {
      onSuccess: () => navigate("/"),
      onError: (error) => {
        handleException(error, {
          onHttpError: ({ response }) => setError(response?.data.detail),
        })
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Login</h1>
      {error && <p className="text-red-300 text-xs my-1">{error}</p>}
      <div className="my-2">
        <label>Email</label>
        <Input
          {...register("emailOrUsername", { required: true })}
          placeholder="Email or username"
        />
      </div>
      <div className="my-2">
        <div className="flex justify-between items-baseline">
          <label>Password</label>
          <Link
            to="/auth/request-password-reset"
            className="text-slate-200 underline text-xs"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          {...register("password", { required: true })}
          type="password"
          placeholder="••••••"
        />
      </div>
      <div className="flex justify-end mt-4">
        <Button type="submit" className="w-full" disabled={login.isPending}>
          Login
        </Button>
      </div>
      <div className="mt-3">
        <p className="text-xs text-slate-200">
          Don't have an account?{" "}
          <Link to="/auth/register" className="text-primary underline">
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  )
}
