# Module 05: React Router

## Overview

In this module, we'll learn how to implement client-side routing with React Router. We'll set up navigation between pages, handle dynamic routes, and implement protected routes for authenticated users.

## Learning Objectives

- Set up React Router in your application
- Create routes and navigation
- Implement dynamic routes with parameters
- Use programmatic navigation
- Create protected routes
- Handle 404 (Not Found) pages

## Prerequisites

- Module 04 completed (React Hooks II)
- Understanding of component composition

---

## 1. Introduction to React Router

### What is Client-Side Routing?

Client-side routing allows navigation between "pages" without full page reloads. The URL changes, but JavaScript handles the rendering of different components.

### Installing React Router

```bash
npm install react-router-dom
```

### Basic Setup

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
```

---

## 2. Defining Routes

### Basic Routes

```tsx
// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import { Dashboard } from '@/pages/Dashboard'
import { Transactions } from '@/pages/Transactions'
import { Categories } from '@/pages/Categories'
import { Budgets } from '@/pages/Budgets'
import { Login } from '@/pages/Login'
import { NotFound } from '@/pages/NotFound'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/budgets" element={<Budgets />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
```

### Route Components Explained

- `<Routes>`: Container for all route definitions
- `<Route>`: Defines a single route
  - `path`: URL pattern to match
  - `element`: Component to render
- `path="*"`: Catch-all for unmatched routes (404)

---

## 3. Navigation

### Link Component

Use `<Link>` instead of `<a>` for internal navigation:

```tsx
import { Link } from 'react-router-dom'

const Navigation = () => {
  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/transactions">Transactions</Link>
      <Link to="/categories">Categories</Link>
      <Link to="/budgets">Budgets</Link>
    </nav>
  )
}
```

### NavLink Component

`<NavLink>` adds active styling automatically:

```tsx
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/transactions"
        className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }
      >
        Transactions
      </NavLink>
    </nav>
  )
}
```

### NavLink with end Prop

The `end` prop ensures exact matching:

```tsx
// Without end: "/" matches "/transactions" too
<NavLink to="/">Dashboard</NavLink>

// With end: "/" only matches exactly "/"
<NavLink to="/" end>Dashboard</NavLink>
```

---

## 4. Layout Routes

### Nested Routes with Outlet

Create a layout that wraps multiple routes:

```tsx
// src/components/layout/Layout.tsx
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const Layout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />  {/* Child routes render here */}
        </main>
      </div>
    </div>
  )
}
```

```tsx
// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { Transactions } from '@/pages/Transactions'
import { Login } from '@/pages/Login'
import { NotFound } from '@/pages/NotFound'

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Routes with layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/budgets" element={<Budgets />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
```

---

## 5. Dynamic Routes

### Route Parameters

Use `:paramName` for dynamic segments:

```tsx
// Routes
<Route path="/transactions/:id" element={<TransactionDetail />} />
<Route path="/categories/:categoryId" element={<CategoryDetail />} />

// Links
<Link to="/transactions/123">View Transaction 123</Link>
<Link to={`/transactions/${transaction.id}`}>View Details</Link>
```

### Accessing Parameters

Use `useParams` hook:

```tsx
import { useParams } from 'react-router-dom'

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>()

  return <h1>Transaction: {id}</h1>
}
```

### Multiple Parameters

```tsx
// Route
<Route path="/reports/:year/:month" element={<MonthlyReport />} />

// Component
const MonthlyReport = () => {
  const { year, month } = useParams<{ year: string; month: string }>()

  return <h1>Report for {month}/{year}</h1>
}
```

### Optional Parameters

Use `?` for optional segments:

```tsx
<Route path="/transactions/:id?" element={<Transactions />} />

const Transactions = () => {
  const { id } = useParams()

  if (id) {
    return <TransactionDetail id={id} />
  }

  return <TransactionList />
}
```

---

## 6. Query Parameters

### Using useSearchParams

```tsx
import { useSearchParams } from 'react-router-dom'

const TransactionList = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const type = searchParams.get('type') || 'all'
  const category = searchParams.get('category') || ''
  const page = Number(searchParams.get('page')) || 1

  const handleTypeChange = (newType: string) => {
    setSearchParams(params => {
      params.set('type', newType)
      params.set('page', '1')  // Reset to page 1
      return params
    })
  }

  return (
    <div>
      <select value={type} onChange={e => handleTypeChange(e.target.value)}>
        <option value="all">All</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      {/* URL: /transactions?type=income&page=1 */}
    </div>
  )
}
```

---

## 7. Programmatic Navigation

### useNavigate Hook

```tsx
import { useNavigate } from 'react-router-dom'

const TransactionForm = () => {
  const navigate = useNavigate()

  const handleSubmit = async (data: FormData) => {
    await createTransaction(data)

    // Navigate after success
    navigate('/transactions')

    // Or navigate with state
    navigate('/transactions', {
      state: { message: 'Transaction created!' }
    })

    // Or replace current history entry
    navigate('/transactions', { replace: true })

    // Go back
    navigate(-1)

    // Go forward
    navigate(1)
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Accessing Navigation State

```tsx
import { useLocation } from 'react-router-dom'

const Transactions = () => {
  const location = useLocation()
  const message = location.state?.message

  useEffect(() => {
    if (message) {
      showToast(message)
      // Clear state to prevent showing on refresh
      window.history.replaceState({}, document.title)
    }
  }, [message])

  return <div>...</div>
}
```

---

## 8. Protected Routes

### Creating a ProtectedRoute Component

```tsx
// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login, preserving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
```

### Using Protected Routes

```tsx
// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/budgets" element={<Budgets />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
```

### Redirecting After Login

```tsx
// src/pages/Login.tsx
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore(state => state.login)

  // Get the page they tried to visit
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (data: LoginData) => {
    await login(data)

    // Redirect back to where they came from
    navigate(from, { replace: true })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## 9. Building the Navigation

### Sidebar Component

```tsx
// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  PiggyBank,
  Settings,
} from 'lucide-react'
import { cn } from '@/utils/cn'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
]

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary-600">FinTrack</h1>
      </div>

      <nav className="px-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-50 text-primary-600'
                : 'text-slate-600 hover:bg-slate-100'
            )
          }
        >
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
      </div>
    </aside>
  )
}
```

### Header Component

```tsx
// src/components/layout/Header.tsx
import { useLocation } from 'react-router-dom'
import { Bell, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/categories': 'Categories',
  '/budgets': 'Budgets',
  '/settings': 'Settings',
}

export const Header = () => {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'FinTrack'

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
```

---

## 10. Not Found Page

```tsx
// src/pages/NotFound.tsx
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-slate-200 dark:text-slate-700">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
          Page Not Found
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button
            as={Link}
            to="/"
            leftIcon={<Home className="h-4 w-4" />}
          >
            Go Home
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

## 11. Code Splitting with Lazy Loading

### React.lazy and Suspense

```tsx
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Lazy load pages
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Transactions = lazy(() => import('@/pages/Transactions'))
const Categories = lazy(() => import('@/pages/Categories'))
const Budgets = lazy(() => import('@/pages/Budgets'))

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/budgets" element={<Budgets />} />
      </Routes>
    </Suspense>
  )
}
```

### Named Exports with Lazy

```tsx
// For named exports, create an intermediate file
// src/pages/Dashboard/index.ts
export { Dashboard as default } from './Dashboard'

// Or use this pattern
const Dashboard = lazy(() =>
  import('@/pages/Dashboard').then(module => ({
    default: module.Dashboard
  }))
)
```

---

## 12. Common Pitfalls & Debugging Tips

### Pitfall 1: NavLink `end` Prop for Root Path

```tsx
// ❌ Bug: "/" is always active because all paths start with "/"
<NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
  Dashboard
</NavLink>

// ✅ Fix: Use the `end` prop to match exactly
<NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
  Dashboard
</NavLink>
```

### Pitfall 2: Forgetting to Handle Missing Route Params

```tsx
// ❌ Bug: Crashes if id is undefined
const TransactionDetail = () => {
  const { id } = useParams()
  const { data } = useTransaction(id)  // id could be undefined!
}

// ✅ Fix: Handle the undefined case
const TransactionDetail = () => {
  const { id } = useParams()

  if (!id) {
    return <Navigate to="/transactions" replace />
  }

  const { data } = useTransaction(id)
}
```

### Pitfall 3: Navigate vs useNavigate Confusion

```tsx
// ❌ Wrong: Using Navigate component in event handler
const handleClick = () => {
  <Navigate to="/dashboard" />  // Does nothing!
}

// ✅ Fix: Use useNavigate hook for programmatic navigation
const navigate = useNavigate()
const handleClick = () => {
  navigate('/dashboard')
}

// Navigate component is for redirects in render:
if (!isLoggedIn) {
  return <Navigate to="/login" replace />
}
```

### Pitfall 4: Search Params Not Preserved on Navigation

```tsx
// ❌ Bug: Navigating loses search params
const { page } = useSearchParams()
navigate('/transactions')  // Loses ?page=2

// ✅ Fix: Preserve search params when needed
const [searchParams] = useSearchParams()
navigate(`/transactions?${searchParams.toString()}`)

// Or use relative navigation
navigate({ search: searchParams.toString() })
```

### Pitfall 5: Protected Route Infinite Redirects

```tsx
// ❌ Bug: Redirects even after login (state not saved)
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" />  // Missing 'replace' causes history issues
  }

  return children
}

// ✅ Fix: Use replace and save intended destination
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
```

### Debugging Tips

1. **Check the URL**: Use React Router Devtools or browser devtools to see current route state
2. **Log route params**: `console.log(useParams())` to verify params are captured
3. **Check route order**: More specific routes should come before catch-all routes
4. **Verify path matching**: Route paths are case-sensitive by default
5. **Use the `*` catch-all carefully**: Place it last to handle 404s

```tsx
// Route order matters!
<Routes>
  {/* Specific routes first */}
  <Route path="/transactions/new" element={<NewTransaction />} />
  <Route path="/transactions/:id" element={<TransactionDetail />} />
  <Route path="/transactions" element={<TransactionList />} />

  {/* Catch-all last */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## Exercises

### Exercise 1: Breadcrumbs

**Challenge**: Create a breadcrumb component that shows the current navigation path.

```tsx
// Expected output for /transactions/123:
// Home > Transactions > Transaction Details
```

<details>
<summary>💡 Hints</summary>

1. Use `useLocation()` to get the current path
2. Split the pathname by `/` to get segments
3. Build up the path progressively for each breadcrumb link
4. Use a map of paths to labels for readable names

```tsx
// Pattern:
const location = useLocation()
const segments = location.pathname.split('/').filter(Boolean)

// Build breadcrumbs:
// '/transactions/123' -> ['transactions', '123']
// Links: '/' (Home), '/transactions', '/transactions/123'
```

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] Home page shows just "Home"
- [ ] `/transactions` shows "Home > Transactions"
- [ ] `/transactions/123` shows "Home > Transactions > Transaction Details"
- [ ] Each breadcrumb (except last) is clickable
- [ ] Current page is not a link (just text)

</details>

---

### Exercise 2: Tab Navigation

**Challenge**: Create a tabbed interface for the transaction detail page using nested routes.

```tsx
// /transactions/123 - Overview tab (default)
// /transactions/123/history - History tab
// /transactions/123/related - Related tab
```

<details>
<summary>💡 Hints</summary>

1. Create nested routes inside the transaction detail route
2. Use `<NavLink>` for tabs with active styling
3. Use `<Outlet>` to render the active tab content
4. Use index route for the default tab

```tsx
// Route structure:
<Route path="/transactions/:id" element={<TransactionDetail />}>
  <Route index element={<OverviewTab />} />
  <Route path="history" element={<HistoryTab />} />
  <Route path="related" element={<RelatedTab />} />
</Route>

// In TransactionDetail:
<nav>
  <NavLink to="" end>Overview</NavLink>
  <NavLink to="history">History</NavLink>
  <NavLink to="related">Related</NavLink>
</nav>
<Outlet />
```

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] Default tab (Overview) shows on `/transactions/123`
- [ ] Clicking History navigates to `/transactions/123/history`
- [ ] Active tab has different styling
- [ ] Tab content changes when URL changes
- [ ] Browser back/forward works with tabs

</details>

---

### Exercise 3: Pagination

**Challenge**: Implement URL-based pagination for the transactions list.

```tsx
// /transactions?page=1&limit=10
// /transactions?page=2&limit=10
```

<details>
<summary>💡 Hints</summary>

1. Use `useSearchParams()` to read and set query params
2. Default to page 1 and limit 10 if not in URL
3. Create Previous/Next buttons that update the URL
4. Calculate total pages from total items

```tsx
// Pattern:
const [searchParams, setSearchParams] = useSearchParams()
const page = parseInt(searchParams.get('page') || '1')
const limit = parseInt(searchParams.get('limit') || '10')

const goToPage = (newPage: number) => {
  setSearchParams({ page: newPage.toString(), limit: limit.toString() })
}

// Calculate slice of data to show:
const startIndex = (page - 1) * limit
const pageData = transactions.slice(startIndex, startIndex + limit)
```

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] First load shows page 1
- [ ] Clicking Next updates URL to page=2
- [ ] Previous button is disabled on page 1
- [ ] Next button is disabled on last page
- [ ] Manually changing URL updates the view
- [ ] Refreshing the page maintains pagination state

</details>

---

## Checkpoint

At this point, you should have:
- ✅ React Router set up and configured
- ✅ Navigation with Link and NavLink
- ✅ Layout routes with Outlet
- ✅ Dynamic routes with useParams
- ✅ Protected routes for authentication
- ✅ Programmatic navigation with useNavigate

---

## Summary

In this module, we learned:
- React Router enables client-side navigation without page reloads
- `<Routes>` and `<Route>` define the route structure
- `<Link>` and `<NavLink>` create navigation links
- `<Outlet>` renders child routes in layouts
- `useParams` accesses URL parameters
- `useSearchParams` manages query strings
- `useNavigate` enables programmatic navigation
- Protected routes guard authenticated content

## Next Steps

In the next module, we'll learn about handling forms with React Hook Form and implementing validation with Zod.

[← Back to Module 04](../04-hooks-ii/README.md) | [Continue to Module 06: Forms & Validation →](../06-forms/README.md)
