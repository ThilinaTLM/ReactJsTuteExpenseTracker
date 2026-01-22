# Module 12: Polish & Optimization

## Overview

In this final module, we'll polish our application by improving error handling, adding loading states, implementing performance optimizations, and ensuring accessibility.

## Learning Objectives

- Implement error boundaries for graceful error handling
- Add proper loading states and skeletons
- Optimize performance with code splitting and memoization
- Ensure accessibility (a11y) compliance
- Add final polish and animations

## Prerequisites

- Module 11 completed (Authentication)
- All previous modules completed

---

## 1. Error Boundaries

### Creating an Error Boundary

```tsx
// src/components/ErrorBoundary.tsx
import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })

    // Log to error reporting service
    // logErrorToService(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 text-danger-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <Button onClick={() => window.location.reload()} variant="ghost">
                  Refresh Page
                </Button>
                <Button onClick={this.handleRetry} leftIcon={<RefreshCw className="h-4 w-4" />}>
                  Try Again
                </Button>
              </div>
              {import.meta.env.DEV && this.state.errorInfo && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-slate-500">
                    Error details
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Using Error Boundaries

```tsx
// src/App.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Each route can have its own error boundary */}
            <Route
              path="/"
              element={
                <ErrorBoundary fallback={<DashboardError />}>
                  <Dashboard />
                </ErrorBoundary>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
```

---

## 2. Loading States

### Skeleton Components

```tsx
// src/components/ui/Skeleton.tsx
import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200 dark:bg-slate-700',
        className
      )}
    />
  )
}

// Specific skeletons
export const TransactionSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    ))}
  </div>
)

export const CardSkeleton = () => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6">
    <Skeleton className="h-4 w-1/3 mb-4" />
    <Skeleton className="h-8 w-1/2" />
  </div>
)

export const ChartSkeleton = () => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6">
    <Skeleton className="h-4 w-1/4 mb-4" />
    <Skeleton className="h-64 w-full" />
  </div>
)
```

### Loading Fallback

```tsx
// src/components/ui/LoadingFallback.tsx
import { Loader2 } from 'lucide-react'

export const LoadingFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  )
}
```

---

## 3. Code Splitting

### Lazy Loading Pages

```tsx
// src/App.tsx
import { lazy, Suspense } from 'react'
import { LoadingFallback } from '@/components/ui/LoadingFallback'

// Lazy load pages
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Transactions = lazy(() => import('@/pages/Transactions'))
const Categories = lazy(() => import('@/pages/Categories'))
const Budgets = lazy(() => import('@/pages/Budgets'))

const App = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        {/* ... */}
      </Routes>
    </Suspense>
  )
}
```

### Vite Manual Chunks

```tsx
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Query chunk
          query: ['@tanstack/react-query'],
          // Charts chunk
          charts: ['recharts'],
          // Form chunk
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
})
```

---

## 4. Performance Optimization

### Memoizing Components

```tsx
import { memo } from 'react'

// Memoize expensive list items
export const TransactionItem = memo(({ transaction, onEdit, onDelete }: Props) => {
  console.log('TransactionItem rendered:', transaction.id)

  return (
    <div className="...">
      {/* ... */}
    </div>
  )
})

// With custom comparison
export const ExpensiveComponent = memo(
  ({ data, config }: Props) => {
    // ...
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.data.id === nextProps.data.id
  }
)
```

### Using useMemo and useCallback

```tsx
const TransactionList = () => {
  const { data: transactions } = useTransactions()
  const { search, type, sortBy } = useFilterStore()

  // Memoize filtered/sorted list
  const filteredTransactions = useMemo(() => {
    if (!transactions) return []

    let result = [...transactions]

    if (search) {
      result = result.filter((t) =>
        t.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (type !== 'all') {
      result = result.filter((t) => t.type === type)
    }

    return result.sort((a, b) => {
      // sorting logic
    })
  }, [transactions, search, type, sortBy])

  // Memoize callbacks
  const handleEdit = useCallback((id: string) => {
    openModal('editTransaction', { id })
  }, [openModal])

  const handleDelete = useCallback((id: string) => {
    openModal('confirmDelete', { id })
  }, [openModal])

  return (
    <div>
      {filteredTransactions.map((t) => (
        <TransactionItem
          key={t.id}
          transaction={t}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
```

### Virtualized Lists

```tsx
// For very long lists, consider using virtualization
import { useVirtualizer } from '@tanstack/react-virtual'

const VirtualizedList = ({ items }: { items: Transaction[] }) => {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated item height
  })

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualItem.start}px)`,
              width: '100%',
            }}
          >
            <TransactionItem transaction={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 5. Accessibility (a11y)

### ARIA Labels

```tsx
// Button with icon only needs aria-label
<Button
  variant="ghost"
  size="sm"
  onClick={toggleTheme}
  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
>
  <Moon className="h-5 w-5" />
</Button>

// Form fields with proper labeling
<div>
  <label htmlFor="email" className="sr-only">Email</label>
  <input
    id="email"
    type="email"
    aria-describedby="email-error"
    aria-invalid={!!errors.email}
  />
  {errors.email && (
    <p id="email-error" role="alert">
      {errors.email.message}
    </p>
  )}
</div>
```

### Focus Management

```tsx
// Modal focus trap
import { useRef, useEffect } from 'react'

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Focus first focusable element
      const focusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      focusable?.focus()
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {children}
    </div>
  )
}
```

### Screen Reader Announcements

```tsx
// src/components/ui/ScreenReaderAnnouncement.tsx
import { useEffect, useState } from 'react'

export const ScreenReaderAnnouncement = ({
  message,
  politeness = 'polite',
}: {
  message: string
  politeness?: 'polite' | 'assertive'
}) => {
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    setAnnouncement(message)
    const timer = setTimeout(() => setAnnouncement(''), 1000)
    return () => clearTimeout(timer)
  }, [message])

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  )
}
```

### Keyboard Navigation

```tsx
// Accessible dropdown menu
const Dropdown = ({ items }: { items: MenuItem[] }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => (i + 1) % items.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => (i - 1 + items.length) % items.length)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        items[activeIndex].onClick()
        setIsOpen(false)
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  return (
    <div onKeyDown={handleKeyDown}>
      <button
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        Menu
      </button>
      {isOpen && (
        <ul role="menu">
          {items.map((item, index) => (
            <li
              key={item.id}
              role="menuitem"
              tabIndex={index === activeIndex ? 0 : -1}
              aria-current={index === activeIndex}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

---

## 6. Animations

### CSS Transitions with Tailwind

```tsx
// Fade in animation
<div className="animate-in fade-in duration-300">
  Content
</div>

// Slide in animation
<div className="animate-in slide-in-from-right duration-300">
  Slide content
</div>

// Custom animation
<style>
@keyframes bounce-in {
  0% { transform: scale(0.95); opacity: 0; }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); opacity: 1; }
}

.animate-bounce-in {
  animation: bounce-in 0.3s ease-out;
}
</style>
```

### Toast Animations

```tsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)', opacity: 1 },
          '100%': { transform: 'translateX(100%)', opacity: 0 },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-in',
      },
    },
  },
}
```

---

## 7. Final Checklist

### Functionality
- [ ] All CRUD operations work correctly
- [ ] Forms validate and submit properly
- [ ] Auth flow works (login, register, logout)
- [ ] Protected routes redirect correctly
- [ ] Filters and search work
- [ ] Charts display correct data

### Performance
- [ ] Lazy loading implemented for pages
- [ ] Components memoized where appropriate
- [ ] No unnecessary re-renders
- [ ] Bundle size optimized

### User Experience
- [ ] Loading states for async operations
- [ ] Error states with recovery options
- [ ] Toast notifications for feedback
- [ ] Responsive on all screen sizes
- [ ] Dark mode works correctly

### Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] Proper ARIA labels
- [ ] Focus management in modals
- [ ] Color contrast meets WCAG standards
- [ ] Screen reader friendly

### Code Quality
- [ ] No TypeScript errors
- [ ] Consistent code style
- [ ] Components are reusable
- [ ] Business logic separated from UI

---

## 8. Production Build

### Building the App

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

```bash
# .env.production
VITE_API_URL=https://api.yourapp.com
```

### Deployment

The built files in `dist/` can be deployed to any static hosting:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

---

## Congratulations! 🎉

You've completed the React Personal Finance Tracker tutorial!

### What You've Learned

1. **React Fundamentals**: Components, props, state, hooks
2. **TypeScript**: Type-safe React development
3. **Styling**: Tailwind CSS with dark mode
4. **Routing**: React Router for navigation
5. **Forms**: React Hook Form with Zod validation
6. **Server State**: TanStack Query for data fetching
7. **Client State**: Zustand for global state
8. **Charts**: Recharts for data visualization
9. **Authentication**: Complete auth flow
10. **Polish**: Error handling, loading states, accessibility

### Next Steps

- Add more features (recurring transactions, goals, reports)
- Connect to a real backend
- Add end-to-end tests
- Deploy to production
- Share your project!

### Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Recharts Documentation](https://recharts.org)

---

[← Back to Module 11](../11-auth/README.md) | [Back to Introduction](../00-introduction/README.md)
