import React, { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'

const DarkModeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  useEffect(() => {
    // Check the initial theme from localStorage or system preference
    const storedTheme = localStorage.getItem('theme')
    if (
      storedTheme === 'dark' ||
      (!storedTheme &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
      setIsDarkMode(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDarkMode(false)
    }
  }, [])

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDarkMode(true)
    }
  }

  return (
    <button
      onClick={toggleDarkMode}
      className="py-4 text-sm font-semibold dark:text-white"
    >
      {isDarkMode ? (
        <SunIcon className="w-5 h-5 mx-0.5 -top-0.25 relative" />
      ) : (
        <MoonIcon className="w-5 h-5 mx-0.5 -top-0.25 relative" />
      )}
    </button>
  )
}

export default DarkModeToggle
