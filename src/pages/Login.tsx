import { Button, Input } from "@/components/ui"
import { useUserLogin } from "@/queries/user"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

type LoginForm = {
  emailOrUsername: string
  password: string
}

export const LoginPage = () => {
  const { register, handleSubmit } = useForm<LoginForm>()
  const navigate = useNavigate()
  const login = useUserLogin()

  const onSubmit = (data: LoginForm) => {
    login.mutate(data, {
      onSuccess: () => navigate("/"),
      onError: (error) => {
        console.log("login failed", error)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Login</h1>
      <div className="my-2">
        <label>Email</label>
        <Input {...register("emailOrUsername", { required: true })} />
      </div>
      <div className="my-2">
        <label>Password</label>
        <Input {...register("password", { required: true })} type="password" />
      </div>
      <div className="flex justify-end mt-4">
        <Button type="submit" disabled={login.isPending}>
          Login
        </Button>
      </div>
    </form>
  )
}
