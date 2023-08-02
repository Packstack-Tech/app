import { Link } from "react-router-dom"

export const Header = () => {
  return (
    <div className="p-4 bg-slate-900">
      <div className="flex justify-between">
        <div>Packstack</div>
        <div>
          <Link to="/auth/login">Login</Link>
        </div>
      </div>
    </div>
  )
}
