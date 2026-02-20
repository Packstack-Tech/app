import { ExternalLink, LogOut, Moon, Plus, Settings, Sun } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'

import logo from '/packstack_logo_white.png'
import { Button } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useDarkMode } from '@/hooks/useDarkMode'

const navLinks = [
  { name: 'Packing Lists', path: '/' as const },
  { name: 'Inventory', path: '/inventory' as const },
]

export const Header = () => {
  const navigate = useNavigate()
  const { isDark, toggle: toggleDarkMode } = useDarkMode()

  const onLogout = () => {
    localStorage.removeItem('jwt')
    navigate({ to: '/auth/login' })
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 h-14">
        <div className="flex items-center">
          <Link to="/" className="w-[100px] shrink-0">
            <img src={logo} className="invert dark:invert-0" alt="Packstack" />
          </Link>
        </div>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ name, path }) => (
            <Link
              key={path}
              to={path}
              activeOptions={{ exact: path === '/' }}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:text-foreground"
              activeProps={{
                className: 'bg-accent text-foreground',
              }}
              inactiveProps={{
                className: 'text-muted-foreground',
              }}
            >
              {name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/pack/new">
              <Plus size={16} strokeWidth={2.5} />
              Create Pack
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Settings size={18} />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
                <Settings size={14} />
                Settings
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={e => {
                  e.preventDefault()
                  toggleDarkMode()
                }}
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
                Dark mode
                <span
                  role="switch"
                  aria-checked={isDark}
                  className="ml-auto relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors bg-input data-[state=checked]:bg-primary"
                  data-state={isDark ? 'checked' : 'unchecked'}
                >
                  <span className="pointer-events-none block h-3.5 w-3.5 rounded-full bg-background shadow-sm transition-transform translate-x-0.5 data-[state=checked]:translate-x-4" data-state={isDark ? 'checked' : 'unchecked'} />
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <a
                  href="https://www.reddit.com/r/packstack/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={14} />
                  Join the Subreddit
                </a>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={onLogout}>
                <LogOut size={14} />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
