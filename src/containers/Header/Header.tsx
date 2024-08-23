import { NavLink } from 'react-router-dom'

import logo from '/packstack_logo_white.png'
import DarkModeToggle from '@/components/ui/DarkModeToggle'

export const Header = () => {
  const authenticatedLinks = [
    {
      name: 'Packing Lists',
      path: '/',
    },
    {
      name: 'Inventory',
      path: '/inventory',
    },
    {
      name: 'Create Pack',
      path: '/pack/new',
    },
    {
      name: 'Settings',
      path: '/settings',
    },
  ]

  return (
    <div className="px-4 bg-slate-50 dark:bg-slate-900">
      <div className="flex justify-between items-center">
        <div className="w-[120px]">
          <img src={logo} className="invert dark:invert-0" alt="" />
        </div>
        <div className="flex gap-6">
          {authenticatedLinks.map(({ name, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `py-4 text-sm font-semibold ${
                  isActive ? 'border-b-2 border-primary' : ''
                }`
              }
            >
              {name}
            </NavLink>
          ))}
          <DarkModeToggle />
        </div>
      </div>
    </div>
  )
}
