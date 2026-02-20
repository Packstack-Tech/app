import React from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'

import { useDarkMode } from '@/hooks/useDarkMode'

const DarkModeToggle: React.FC = () => {
  const { isDark, toggle } = useDarkMode()

  return (
    <button
      onClick={toggle}
      className="py-4 text-sm font-semibold dark:text-white"
    >
      {isDark ? (
        <SunIcon className="w-5 h-5 mx-0.5 -top-0.25 relative" />
      ) : (
        <MoonIcon className="w-5 h-5 mx-0.5 -top-0.25 relative" />
      )}
    </button>
  )
}

export default DarkModeToggle
