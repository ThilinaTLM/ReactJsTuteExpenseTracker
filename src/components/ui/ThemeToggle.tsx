import { Moon, Sun, Monitor } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useThemeStore } from '@/stores/useThemeStore'
import type { Theme } from '@/types'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
  variant?: 'icon' | 'dropdown' | 'buttons'
}

export function ThemeToggle({ className, showLabel = false, variant = 'icon' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useThemeStore()

  if (variant === 'icon') {
    const toggleTheme = () => {
      const themes: Theme[] = ['light', 'dark', 'system']
      const currentIndex = themes.indexOf(theme)
      const nextIndex = (currentIndex + 1) % themes.length
      setTheme(themes[nextIndex])
    }

    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'flex items-center gap-2 rounded-lg p-2 text-slate-600 transition-colors',
          'hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
          className
        )}
        aria-label={`Current theme: ${theme}. Click to change.`}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-5 w-5" />
        ) : theme === 'system' ? (
          <Monitor className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
        {showLabel && (
          <span className="text-sm font-medium capitalize">{theme}</span>
        )}
      </button>
    )
  }

  if (variant === 'buttons') {
    const themes: { value: Theme; icon: React.ElementType; label: string }[] = [
      { value: 'light', icon: Sun, label: 'Light' },
      { value: 'dark', icon: Moon, label: 'Dark' },
      { value: 'system', icon: Monitor, label: 'System' },
    ]

    return (
      <div className={cn('flex rounded-lg border border-slate-200 p-1 dark:border-slate-700', className)}>
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              theme === value
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50'
            )}
            aria-pressed={theme === value}
          >
            <Icon className="h-4 w-4" />
            {showLabel && <span>{label}</span>}
          </button>
        ))}
      </div>
    )
  }

  // Dropdown variant
  return (
    <div className={cn('relative', className)}>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="flex h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm dark:border-slate-600 dark:bg-slate-900"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  )
}
