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

### State Management Decision Guide

Use this flowchart to decide which state solution to use:

```
                    ┌─────────────────────┐
                    │  Where does the     │
                    │  data come from?    │
                    └─────────┬───────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
        ┌─────────┐                     ┌─────────┐
        │  Server │                     │  Client │
        │  (API)  │                     │  (Local)│
        └────┬────┘                     └────┬────┘
             │                               │
             ▼                               ▼
    ┌────────────────┐            ┌──────────────────┐
    │ TanStack Query │            │ How many         │
    │ (useQuery,     │            │ components need  │
    │  useMutation)  │            │ this data?       │
    └────────────────┘            └────────┬─────────┘
                                           │
                              ┌────────────┴────────────┐
                              ▼                         ▼
                         ┌────────┐               ┌──────────┐
                         │ 1-2    │               │ Many     │
                         │ nearby │               │ or far   │
                         └───┬────┘               └────┬─────┘
                             │                         │
                             ▼                         ▼
                      ┌────────────┐           ┌────────────────┐
                      │  useState  │           │ Complex state? │
                      │  + props   │           │ Need outside   │
                      └────────────┘           │ React access?  │
                                               └───────┬────────┘
                                                       │
                                           ┌───────────┴───────────┐
                                           ▼                       ▼
                                        ┌─────┐               ┌──────────┐
                                        │ Yes │               │   No     │
                                        └──┬──┘               └────┬─────┘
                                           │                       │
                                           ▼                       ▼
                                    ┌──────────┐            ┌──────────────┐
                                    │  Zustand │            │ Context API  │
                                    └──────────┘            │ (or Zustand) │
                                                            └──────────────┘
```

### Quick Reference Table

| Data Type | Solution | Example |
|-----------|----------|---------|
| API responses | TanStack Query | Transactions, user profile |
| Form input values | useState | Input fields, form state |
| UI state (1 component) | useState | Dropdown open, input focus |
| UI state (shared) | Zustand | Modal open, sidebar collapsed |
| Theme/preferences | Zustand + persist | Dark mode, locale |
| Auth state | Zustand + persist | Token, current user |
| Filters (URL sync) | URL params | Search query, pagination |
| Filters (no URL) | Zustand | Advanced filters in memory |
| Ephemeral notifications | Zustand | Toasts, alerts |

### Rules of Thumb

1. **Start simple**: Begin with `useState`, lift state up as needed
2. **Server data → TanStack Query**: Don't manually cache API responses
3. **UI state → Local first**: Most UI state doesn't need to be global
4. **Shared state → Zustand**: When passing props becomes painful
5. **Persist preferences → Zustand + middleware**: Theme, language, settings
6. **Don't over-engineer**: Many apps only need useState + TanStack Query

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

## 10. Common Pitfalls & Debugging Tips

### Pitfall 1: Selecting the Entire Store

```tsx
// ❌ Bug: Component re-renders on ANY state change
const MyComponent = () => {
  const store = useAuthStore()  // Subscribes to everything!
  return <p>{store.user?.name}</p>
}

// ✅ Fix: Select only what you need
const MyComponent = () => {
  const userName = useAuthStore((state) => state.user?.name)
  return <p>{userName}</p>
}
```

### Pitfall 2: Creating New Object References in Selectors

```tsx
// ❌ Bug: New object every render causes infinite re-renders
const MyComponent = () => {
  const data = useFilterStore((state) => ({
    search: state.search,
    type: state.type,
  }))  // New object reference every time!
}

// ✅ Fix: Use useShallow for object selectors
import { useShallow } from 'zustand/react/shallow'

const MyComponent = () => {
  const data = useFilterStore(
    useShallow((state) => ({
      search: state.search,
      type: state.type,
    }))
  )
}
```

### Pitfall 3: Mutating State Directly

```tsx
// ❌ Bug: Directly mutating state doesn't trigger updates
const useStore = create((set) => ({
  items: [],
  addItem: (item) => {
    // This doesn't work!
    set((state) => {
      state.items.push(item)
      return state
    })
  },
}))

// ✅ Fix: Always return new state objects
const useStore = create((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],  // New array
    })),
}))
```

### Pitfall 4: Persist Middleware with Sensitive Data

```tsx
// ❌ Bug: Token stored in localStorage (security risk!)
const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      // ...
    }),
    { name: 'auth-storage' }  // Persists token!
  )
)

// ✅ Fix: Use partialize to exclude sensitive data
const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      // ...
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,  // Only persist user, not token
      }),
    }
  )
)
```

### Pitfall 5: Using getState() in Render

```tsx
// ❌ Bug: Component won't re-render when state changes
const MyComponent = () => {
  const count = useStore.getState().count  // No subscription!
  return <p>{count}</p>
}

// ✅ Fix: Use the hook for reactive updates
const MyComponent = () => {
  const count = useStore((state) => state.count)  // Subscribes to changes
  return <p>{count}</p>
}

// getState() is for use OUTSIDE React components
useStore.getState().increment()  // ✓ Correct usage
```

### Debugging Tips

1. **Install Redux DevTools**: Zustand integrates with it via `devtools` middleware
   ```tsx
   import { devtools } from 'zustand/middleware'

   const useStore = create(
     devtools(
       (set) => ({ /* ... */ }),
       { name: 'MyStore' }
     )
   )
   ```

2. **Log state changes**: Add middleware for debugging
   ```tsx
   const log = (config) => (set, get, api) =>
     config(
       (...args) => {
         console.log('prev state:', get())
         set(...args)
         console.log('next state:', get())
       },
       get,
       api
     )

   const useStore = create(log((set) => ({ /* ... */ })))
   ```

3. **Check subscription count**: Too many can indicate selector issues
4. **Verify persist hydration**: Check localStorage and `onRehydrateStorage` callback

### When to Use Zustand vs TanStack Query

| Zustand | TanStack Query |
|---------|----------------|
| Client-only state (theme, UI) | Server data (API responses) |
| Synchronous updates | Async data with caching |
| No caching needed | Automatic cache invalidation |
| Simple state shapes | Complex data relationships |

---

## Exercises

### Exercise 1: Notification Preferences Store

**Challenge**: Create a store for notification preferences with persistence.

Requirements:
- Email notifications on/off
- Push notifications on/off
- Notification frequency (immediate/daily/weekly)
- Persist to localStorage

<details>
<summary>💡 Hints</summary>

1. Use the `persist` middleware
2. Define interface for the state shape
3. Create toggle actions for boolean values

```tsx
// Pattern:
interface NotificationStore {
  emailEnabled: boolean
  pushEnabled: boolean
  frequency: 'immediate' | 'daily' | 'weekly'
  toggleEmail: () => void
  togglePush: () => void
  setFrequency: (freq: NotificationStore['frequency']) => void
}

const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      emailEnabled: true,
      pushEnabled: true,
      frequency: 'immediate',
      toggleEmail: () => set((s) => ({ emailEnabled: !s.emailEnabled })),
      // ...
    }),
    { name: 'notification-preferences' }
  )
)
```

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] Toggle switches change state
- [ ] Frequency dropdown updates state
- [ ] Refresh page - settings persist
- [ ] Clear localStorage - reverts to defaults
- [ ] Check localStorage in DevTools - see stored values

</details>

---

### Exercise 2: Recent Searches Store

**Challenge**: Create a store for recent searches with a maximum limit.

Requirements:
- Store last 10 searches
- Add new search (moves to top if duplicate)
- Clear all history
- Persist to localStorage

<details>
<summary>💡 Hints</summary>

1. Use an array for searches
2. When adding, filter out duplicates first, then prepend
3. Use `.slice(0, 10)` to limit to 10 items

```tsx
// Pattern:
interface SearchStore {
  searches: string[]
  addSearch: (query: string) => void
  clearSearches: () => void
}

const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      searches: [],
      addSearch: (query) => set((state) => ({
        searches: [
          query,
          ...state.searches.filter(s => s !== query)  // Remove duplicate
        ].slice(0, 10)  // Keep max 10
      })),
      clearSearches: () => set({ searches: [] }),
    }),
    { name: 'recent-searches' }
  )
)
```

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] New search appears at top of list
- [ ] Duplicate search moves to top (not duplicated)
- [ ] 11th search removes the oldest
- [ ] Clear removes all searches
- [ ] Searches persist after refresh

</details>

---

### Exercise 3: Transaction Draft Store

**Challenge**: Create a store that saves form drafts when navigating away.

Requirements:
- Save partial form data as draft
- Restore when returning to form
- Clear draft after successful submit
- Don't persist (only in-memory)

<details>
<summary>💡 Hints</summary>

1. Store partial form data with Partial<TransactionFormData>
2. Call `saveDraft` in a useEffect cleanup or beforeunload
3. Call `clearDraft` after successful mutation
4. No persist middleware needed (in-memory only)

```tsx
// Pattern:
interface DraftStore {
  draft: Partial<TransactionFormData> | null
  saveDraft: (data: Partial<TransactionFormData>) => void
  clearDraft: () => void
}

// In form component:
useEffect(() => {
  // Restore draft if exists
  const draft = useDraftStore.getState().draft
  if (draft) {
    reset(draft)  // react-hook-form reset
  }

  // Save draft on unmount
  return () => {
    const values = getValues()
    if (Object.values(values).some(v => v)) {
      saveDraft(values)
    }
  }
}, [])

// After successful submit:
clearDraft()
```

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] Fill form partially, navigate away, return - form is restored
- [ ] Submit successfully - draft is cleared
- [ ] Refresh page - draft is gone (in-memory only)
- [ ] Empty form doesn't save draft
- [ ] New transaction page starts with draft if available

</details>

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
