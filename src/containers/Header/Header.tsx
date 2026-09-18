import { useState } from 'react'
import {
  ExternalLink,
  LogOut,
  MessageSquare,
  Moon,
  Plus,
  Settings,
  Sparkles,
  Sun,
  UserRound,
} from 'lucide-react'
import * as Sentry from '@sentry/react'
import { useQueryClient } from '@tanstack/react-query'
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
import { HikerProfileForm } from '@/containers/HikerProfileForm/HikerProfileForm'
import { NewTripModal } from '@/containers/NewTripModal'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useSubscription } from '@/hooks/useSubscription'
import { useTripLimit } from '@/hooks/useTripLimit'
import { logout } from '@/lib/api'
import { Mixpanel } from '@/lib/mixpanel'
import { useHikerProfileQuery } from '@/queries/hiker-profile'

const navLinks = [
  { name: 'Packs', path: '/packs' as const },
  { name: 'Gear Closet', path: '/inventory' as const },
  { name: 'Kits', path: '/kits' as const },
]

export const Header = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isDark, toggle: toggleDarkMode } = useDarkMode()
  const { canCreateTrip, openUpgrade } = useTripLimit()
  const { isSubscribed } = useSubscription()
  const [showNewTrip, setShowNewTrip] = useState(false)
  const [showHikerProfile, setShowHikerProfile] = useState(false)
  const { profile: hikerProfile } = useHikerProfileQuery()

  const onCreatePack = () => {
    if (canCreateTrip) {
      setShowNewTrip(true)
    } else {
      openUpgrade('trip_limit')
    }
  }

  const onLogout = async () => {
    try {
      await logout()
    } finally {
      Sentry.setUser(null)
      Mixpanel.track('User:Logout')
      Mixpanel.reset()
      queryClient.clear()
      navigate({ to: '/auth/login' })
    }
  }

  return (
    <header className="border-b border-border bg-card">
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
          <a
            href="https://www.packstack.io/tools/ultralight-research"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground"
          >
            Research
            <ExternalLink size={13} className="opacity-70" />
          </a>
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={onCreatePack}>
            <Plus size={16} strokeWidth={2.5} />
            Create Pack
          </Button>
          <NewTripModal open={showNewTrip} onOpenChange={setShowNewTrip} />
          <HikerProfileForm
            open={showHikerProfile}
            onOpenChange={setShowHikerProfile}
            profile={hikerProfile}
          />

          {!isSubscribed && (
            <Button size="sm" className="cursor-pointer" onClick={() => openUpgrade('header')}>
              <Sparkles size={14} />
              Upgrade
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Settings size={18} />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowHikerProfile(true)}>
                <UserRound size={14} />
                Hiker Profile
              </DropdownMenuItem>

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
                  href="https://packstack.userjot.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageSquare size={14} />
                  Give Feedback
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
