import { createBrowserRouter } from "react-router-dom"
import { AppLayout } from "@/containers/Layout/App"
import { AuthLayout } from "@/containers/Layout/Auth"
import { LoginPage } from "@/pages/Login"
import { PackPage } from "@/pages/Pack"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <div>Home</div>,
      },
      {
        path: "/about",
        element: <div>About</div>,
      },
      {
        path: "/pack/new",
        element: <PackPage />,
      },
      {
        path: "/pack/:id",
        element: <PackPage />,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <div>Register</div>,
      },
    ],
  },
])
