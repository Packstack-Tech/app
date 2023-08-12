import { Link } from "react-router-dom"

export const Header = () => {
  return (
    <div className="p-4 bg-slate-900">
      <div className="flex justify-between">
        <div>Packstack</div>
        <div className="flex gap-4">
          <Link to="/inventory">Inventory</Link>
          <Link to="/pack/new">Create Pack</Link>
        </div>
      </div>
    </div>
  )
}
