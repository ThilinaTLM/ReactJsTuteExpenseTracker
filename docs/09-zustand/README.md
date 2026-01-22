# Module 09: Zustand State Management

## Overview

In this module, we'll learn how to manage global client state with Zustand. We'll create stores for theme preferences, authentication, UI state, and filters.

## Learning Objectives

- Understand when to use global state vs local state
- Create Zustand stores with TypeScript
- Implement selectors for optimal re-renders
- Persist state to localStorage
- Combine multiple stores

## Prerequisites

- Module 08 completed (TanStack Query II)
- Understanding of React state management

---

## 1. When to Use Zustand vs TanStack Query

### TanStack Query (Server State)

- Data from APIs
- Needs caching, syncing, refetching
- Examples: transactions, categories, budgets, user profile

### Zustand (Client State)

- UI state (modals, sidebars, toasts)
- User preferences (theme, language)
- Filters and search terms
- Authentication status
- Any state that doesn't come from a server

---

## 2. Introduction to Zustand

### Why Zustand?

- **Simple**: Minimal boilerplate
- **Small**: ~1KB bundle size
- **Fast**: No providers needed
- **Flexible**: Works inside/outside React
- **TypeScript**: First-class support

### Basic Store

```tsx
import { create } from 'zustand'

interface CounterStore {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))

// Usage in component
const Counter = () => {
  const count = useCounterStore((state) => state.count)
  const increment = useCounterStore((state) => state.increment)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
    </div>
  )
}
```

---

## 3. Theme Store

### Creating the Store

```tsx
// src/stores/useThemeStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
```

### Using the Theme Store

```tsx
// src/hooks/useTheme.ts
import { useEffect } from 'react'
import { useThemeStore } from '@/stores/useThemeStore'

export const useTheme = () => {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (resolvedTheme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)
    }

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      applyTheme(systemTheme)

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light')
      }
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      applyTheme(theme)
    }
  }, [theme])

  return { theme, setTheme }
}
```

### Theme Toggle Component

```tsx
// src/components/ui/ThemeToggle.tsx
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from './Button'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme}>
      <Icon className="h-5 w-5" />
    </Button>
  )
}
```

---

## 4. Auth Store

### Creating the Auth Store

```tsx
// src/stores/useAuthStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
}

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
```

### Using Auth Store in Protected Route

```tsx
// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
```

---

## 5. UI Store

### Creating the UI Store

```tsx
// src/stores/useUIStore.ts
import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

interface UIStore {
  // Sidebar
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Modal
  activeModal: string | null
  modalData: Record<string, unknown> | null
  openModal: (name: string, data?: Record<string, unknown>) => void
  closeModal: () => void

  // Toasts
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  // Sidebar
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // Modal
  activeModal: null,
  modalData: null,
  openModal: (name, data = null) =>
    set({ activeModal: name, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // Toasts
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: `toast-${Date.now()}` },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))

// Helper functions (can be used outside React)
export const showToast = (
  message: string,
  type: Toast['type'] = 'info',
  duration = 5000
) => {
  useUIStore.getState().addToast({ message, type, duration })
}

export const showSuccessToast = (message: string) =>
  showToast(message, 'success')

export const showErrorToast = (message: string) =>
  showToast(message, 'error')
```

### Toast Component

```tsx
// src/components/ui/Toast.tsx
import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { cn } from '@/utils/cn'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles = {
  success: 'bg-success-50 text-success-800 border-success-200',
  error: 'bg-danger-50 text-danger-800 border-danger-200',
  info: 'bg-primary-50 text-primary-800 border-primary-200',
  warning: 'bg-warning-50 text-warning-800 border-warning-200',
}

export const ToastContainer = () => {
  const toasts = useUIStore((state) => state.toasts)
  const removeToast = useUIStore((state) => state.removeToast)

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

const ToastItem = ({
  toast,
  onClose,
}: {
  toast: Toast
  onClose: () => void
}) => {
  const Icon = icons[toast.type]

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(onClose, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.duration, onClose])

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg',
        'animate-in slide-in-from-right-full',
        styles[toast.type]
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <p className="text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="ml-auto p-1 hover:opacity-70"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
```

---

## 6. Filter Store

### Creating the Filter Store

```tsx
// src/stores/useFilterStore.ts
import { create } from 'zustand'

type TransactionType = 'all' | 'income' | 'expense'
type SortBy = 'date' | 'amount' | 'description'
type SortOrder = 'asc' | 'desc'

interface FilterStore {
  // Filters
  search: string
  type: TransactionType
  categoryId: string
  startDate: string
  endDate: string

  // Sorting
  sortBy: SortBy
  sortOrder: SortOrder

  // Actions
  setSearch: (search: string) => void
  setType: (type: TransactionType) => void
  setCategoryId: (categoryId: string) => void
  setDateRange: (start: string, end: string) => void
  setSorting: (sortBy: SortBy, sortOrder?: SortOrder) => void
  resetFilters: () => void
}

const initialState = {
  search: '',
  type: 'all' as TransactionType,
  categoryId: '',
  startDate: '',
  endDate: '',
  sortBy: 'date' as SortBy,
  sortOrder: 'desc' as SortOrder,
}

export const useFilterStore = create<FilterStore>((set) => ({
  ...initialState,

  setSearch: (search) => set({ search }),

  setType: (type) => set({ type }),

  setCategoryId: (categoryId) => set({ categoryId }),

  setDateRange: (startDate, endDate) => set({ startDate, endDate }),

  setSorting: (sortBy, sortOrder) =>
    set((state) => ({
      sortBy,
      sortOrder: sortOrder ?? (state.sortBy === sortBy
        ? state.sortOrder === 'asc' ? 'desc' : 'asc'
        : 'desc'),
    })),

  resetFilters: () => set(initialState),
}))
```

### Using Filters with Transactions

```tsx
// src/hooks/useFilteredTransactions.ts
import { useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { useFilterStore } from '@/stores/useFilterStore'
import { useDebounce } from './useDebounce'

export const useFilteredTransactions = () => {
  const { data: transactions, ...queryResult } = useTransactions()

  const {
    search,
    type,
    categoryId,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  } = useFilterStore()

  const debouncedSearch = useDebounce(search, 300)

  const filteredTransactions = useMemo(() => {
    if (!transactions) return []

    let result = [...transactions]

    // Filter by search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      result = result.filter((t) =>
        t.description.toLowerCase().includes(query)
      )
    }

    // Filter by type
    if (type !== 'all') {
      result = result.filter((t) => t.type === type)
    }

    // Filter by category
    if (categoryId) {
      result = result.filter((t) => t.categoryId === categoryId)
    }

    // Filter by date range
    if (startDate) {
      result = result.filter((t) => t.date >= startDate)
    }
    if (endDate) {
      result = result.filter((t) => t.date <= endDate)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'description':
          comparison = a.description.localeCompare(b.description)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [transactions, debouncedSearch, type, categoryId, startDate, endDate, sortBy, sortOrder])

  return {
    ...queryResult,
    data: filteredTransactions,
    totalCount: transactions?.length ?? 0,
    filteredCount: filteredTransactions.length,
  }
}
```

---

## 7. Selectors for Performance

### Why Selectors?

Without selectors, components re-render on any store change:

```tsx
// ❌ Re-renders on ANY store change
const Component = () => {
  const store = useUIStore()
  return <p>{store.toasts.length} toasts</p>
}

// ✅ Only re-renders when toasts change
const Component = () => {
  const toastCount = useUIStore((state) => state.toasts.length)
  return <p>{toastCount} toasts</p>
}
```

### Multiple Values

```tsx
// Option 1: Multiple selectors
const Component = () => {
  const search = useFilterStore((state) => state.search)
  const type = useFilterStore((state) => state.type)
  // ...
}

// Option 2: Shallow comparison for objects
import { useShallow } from 'zustand/react/shallow'

const Component = () => {
  const { search, type, categoryId } = useFilterStore(
    useShallow((state) => ({
      search: state.search,
      type: state.type,
      categoryId: state.categoryId,
    }))
  )
}

// Option 3: Pick specific fields
const Component = () => {
  const filters = useFilterStore(
    useShallow((state) => [state.search, state.type, state.categoryId])
  )
}
```

---

## 8. Middleware

### Persist Middleware

```tsx
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      // ...state and actions
    }),
    {
      name: 'store-name',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ /* only persist these fields */ }),
      onRehydrateStorage: () => (state) => {
        console.log('State rehydrated:', state)
      },
    }
  )
)
```

### DevTools Middleware

```tsx
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set(
        (state) => ({ count: state.count + 1 }),
        false,
        'increment' // Action name for devtools
      ),
    }),
    { name: 'CounterStore' }
  )
)
```

### Combining Middleware

```tsx
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

const useStore = create(
  devtools(
    persist(
      (set) => ({
        // state and actions
      }),
      { name: 'store-storage' }
    ),
    { name: 'StoreName' }
  )
)
```

---

## 9. Actions Outside React

```tsx
// src/stores/useAuthStore.ts
export const useAuthStore = create<AuthStore>()(/* ... */)

// Use actions outside React
export const logout = () => useAuthStore.getState().logout()

// In API client
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout() // Call store action directly
    }
    return Promise.reject(error)
  }
)
```

---

## Exercises

### Exercise 1: Notification Preferences Store

Create a store for notification preferences:
- Email notifications on/off
- Push notifications on/off
- Notification frequency
- Persist to localStorage

### Exercise 2: Recent Searches Store

Create a store for recent searches:
- Store last 10 searches
- Add new search
- Clear history
- Persist to localStorage

### Exercise 3: Transaction Draft Store

Create a store for draft transactions:
- Save form state when navigating away
- Restore when returning
- Clear after successful submit

---

## Checkpoint

At this point, you should have:
- ✅ Theme store with persistence
- ✅ Auth store with login/logout
- ✅ UI store for modals and toasts
- ✅ Filter store for transactions
- ✅ Understanding of selectors and middleware

---

## Summary

In this module, we learned:
- Zustand is a lightweight state management library
- Use selectors to optimize re-renders
- Persist middleware saves state to localStorage
- DevTools middleware enables debugging
- Actions can be called outside React components
- Combine Zustand (client state) with TanStack Query (server state)

## Next Steps

In the next module, we'll learn how to create interactive charts and data visualizations with Recharts.

[← Back to Module 08](../08-tanstack-query-ii/README.md) | [Continue to Module 10: Charts →](../10-charts/README.md)
