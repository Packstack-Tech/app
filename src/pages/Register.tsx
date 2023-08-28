import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input } from "@/components/ui"
import { useUserRegister } from "@/queries/user"
import { handleException } from "@/lib/utils"

type RegisterForm = {
  username: string
  email: string
  password: string
}

const schema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores (_)"
    ),
  email: z.string().email(),
  password: z.string().min(6).max(50),
})

export const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    mode: "onBlur",
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", password: "" },
  })
  const [error, setError] = useState<string | undefined>()
  const navigate = useNavigate()
  const signUp = useUserRegister()

  const onSubmit = (data: RegisterForm) => {
    setError(undefined)
    signUp.mutate(data, {
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
      <h1>Sign Up</h1>
      {error && <p className="text-red-300 text-xs my-1">{error}</p>}
      <div className="my-2">
        <label>Username</label>
        <Input
          {...register("username", { required: true })}
          placeholder="username"
        />
        <p className=" text-red-300 text-xs my-1">{errors.username?.message}</p>
      </div>
      <div className="my-2">
        <label>Email</label>
        <Input
          {...register("email", { required: true })}
          placeholder="john@muir.com"
        />
        <p className=" text-red-300 text-xs my-1">{errors.email?.message}</p>
      </div>
      <div className="my-2">
        <label>Password</label>
        <Input
          {...register("password", { required: true })}
          type="password"
          placeholder="••••••"
        />
        <p className=" text-red-300 text-xs my-1">{errors.password?.message}</p>
      </div>
      <div className="flex justify-end mt-4">
        <Button type="submit" className="w-full" disabled={signUp.isPending}>
          Sign Up
        </Button>
      </div>
      <div className="mt-3">
        <p className="text-xs text-slate-200">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary underline">
            Login
          </Link>
        </p>
      </div>
    </form>
  )
}
