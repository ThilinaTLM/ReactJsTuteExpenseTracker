# Module 11: Authentication

## Overview

In this module, we'll implement a complete authentication flow including login, registration, protected routes, and session management. We'll use our mock API to simulate authentication.

## Learning Objectives

- Implement login and registration forms
- Manage authentication state with Zustand
- Protect routes requiring authentication
- Handle session persistence
- Implement logout functionality

## Prerequisites

- Module 10 completed (Charts)
- Understanding of forms and state management

---

## 1. Auth Service

### API Endpoints

```tsx
// src/services/auth.ts
import { api } from './api'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
}

interface AuthResponse {
  user: {
    id: string
    email: string
    name: string
  }
  token: string
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // In a real app, this would hit a login endpoint
    // For mock API, we'll simulate it
    const users = await api.get<Array<{
      id: string
      email: string
      password: string
      name: string
    }>>('/users')

    const user = users.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    )

    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Generate a mock token
    const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 86400000 }))

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    // Check if user already exists
    const users = await api.get<Array<{ email: string }>>('/users')
    if (users.some((u) => u.email === data.email)) {
      throw new Error('Email already registered')
    }

    // Create new user
    const newUser = await api.post<{
      id: string
      email: string
      name: string
    }>('/users', {
      id: crypto.randomUUID(),
      email: data.email,
      password: data.password,
      name: data.name,
    })

    const token = btoa(JSON.stringify({ userId: newUser.id, exp: Date.now() + 86400000 }))

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      token,
    }
  },

  logout: async (): Promise<void> => {
    // In a real app, this might invalidate the token server-side
    return Promise.resolve()
  },
}
```

---

## 2. Auth Store

### Zustand Store for Authentication

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
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // Start as loading to check persisted auth

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // After rehydration, set loading to false
        state?.setLoading(false)
      },
    }
  )
)
```

---

## 3. Auth Hook

### Custom Hook for Auth Operations

```tsx
// src/hooks/useAuth.ts
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/useAuthStore'
import { authService } from '@/services/auth'
import { showSuccessToast, showErrorToast } from '@/stores/useUIStore'

export const useAuth = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth, logout: storeLogout, user, isAuthenticated, isLoading } = useAuthStore()

  const from = location.state?.from?.pathname || '/'

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      showSuccessToast(`Welcome back, ${data.user.name}!`)
      navigate(from, { replace: true })
    },
    onError: (error: Error) => {
      showErrorToast(error.message)
    },
  })

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      showSuccessToast(`Welcome, ${data.user.name}!`)
      navigate('/', { replace: true })
    },
    onError: (error: Error) => {
      showErrorToast(error.message)
    },
  })

  const logout = async () => {
    try {
      await authService.logout()
      storeLogout()
      showSuccessToast('Logged out successfully')
      navigate('/login', { replace: true })
    } catch (error) {
      showErrorToast('Failed to logout')
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
  }
}
```

---

## 4. Login Page

### Login Form Schema

```tsx
// src/schemas/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>
```

### Login Page Component

```tsx
// src/pages/Login.tsx
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/schemas/auth'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export const Login = () => {
  const { login, isLoginPending } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: LoginFormData) => {
    login(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-primary-600" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Sign in to your account to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoginPending}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Demo credentials:
            </p>
            <p className="text-sm font-mono">
              Email: demo@example.com<br />
              Password: password123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 5. Registration Page

```tsx
// src/pages/Register.tsx
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus } from 'lucide-react'
import { registerSchema, type RegisterFormData } from '@/schemas/auth'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export const Register = () => {
  const { register: registerUser, isRegisterPending } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-primary-600" />
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Start tracking your finances today
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Name"
              {...register('name')}
              error={errors.name?.message}
              placeholder="John Doe"
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isRegisterPending}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 6. Protected Route Component

```tsx
// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
```

### Public Route (Redirect if Authenticated)

```tsx
// src/components/auth/PublicRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface PublicRouteProps {
  children: React.ReactNode
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
```

---

## 7. App Routes Setup

```tsx
// src/App.tsx
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PublicRoute } from '@/components/auth/PublicRoute'
import { LoadingFallback } from '@/components/ui/LoadingFallback'

// Lazy load pages
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Transactions = lazy(() => import('@/pages/Transactions'))
const Categories = lazy(() => import('@/pages/Categories'))
const Budgets = lazy(() => import('@/pages/Budgets'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const App = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected routes with layout */}
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

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App
```

---

## 8. User Menu in Header

```tsx
// src/components/layout/UserMenu.tsx
import { useState } from 'react'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export const UserMenu = () => {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-primary-600" />
        </div>
        <span className="hidden md:block text-sm font-medium">
          {user.name}
        </span>
        <ChevronDown className={cn(
          'h-4 w-4 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-20">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <p className="font-medium text-slate-900 dark:text-white">
                {user.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>

            <div className="p-2">
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                onClick={() => {
                  setIsOpen(false)
                  // Navigate to settings
                }}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-md"
                onClick={() => {
                  setIsOpen(false)
                  logout()
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

---

## 9. Adding Auth to API Client

```tsx
// src/services/api.ts
import { useAuthStore } from '@/stores/useAuthStore'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add auth token if available
    const token = useAuthStore.getState().token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options?.headers,
      },
    })

    // Handle 401 Unauthorized
    if (response.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      throw new Error('Session expired')
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // ... rest of methods
}
```

---

## 10. Session Validation

```tsx
// src/hooks/useValidateSession.ts
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

export const useValidateSession = () => {
  const { token, logout } = useAuthStore()

  useEffect(() => {
    if (!token) return

    try {
      // Decode and check expiration
      const decoded = JSON.parse(atob(token))
      if (decoded.exp < Date.now()) {
        logout()
      }
    } catch {
      logout()
    }
  }, [token, logout])
}

// Use in App.tsx
const App = () => {
  useValidateSession()

  return (
    // ...
  )
}
```

---

## 11. Common Pitfalls & Debugging Tips

### Pitfall 1: Token Stored in Plain LocalStorage

```tsx
// ❌ Security risk: Token in localStorage is vulnerable to XSS
const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      // ...
    }),
    { name: 'auth-storage' }  // Token persisted!
  )
)

// ✅ Better: Only persist non-sensitive data, use httpOnly cookies for tokens in production
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      // token handled separately via httpOnly cookie
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Don't persist token
      }),
    }
  )
)
```

### Pitfall 2: Race Condition on Auth Check

```tsx
// ❌ Bug: Flash of protected content before redirect
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children  // May flash before auth state is loaded!
}

// ✅ Fix: Show loading while auth state is being determined
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return <LoadingSpinner />  // Wait for auth check
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children
}
```

### Pitfall 3: Not Handling 401 Responses Globally

```tsx
// ❌ Bug: Each component must handle expired session individually
const { data } = useQuery({
  queryFn: async () => {
    const res = await fetch('/api/data')
    if (res.status === 401) {
      // Have to handle this everywhere!
    }
  }
})

// ✅ Fix: Handle 401 in API client globally
class ApiClient {
  async request(url) {
    const response = await fetch(url, { /* ... */ })

    if (response.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      throw new Error('Session expired')
    }

    return response.json()
  }
}
```

### Pitfall 4: Redirect Loop on Auth Pages

```tsx
// ❌ Bug: Infinite redirects
// Login redirects to / if authenticated
// / redirects to /login if not authenticated
// If auth state is inconsistent, loops forever!

// ✅ Fix: Add isLoading check and use replace
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) return <LoadingSpinner />

  if (isAuthenticated) {
    return <Navigate to="/" replace />  // 'replace' prevents history buildup
  }

  return children
}
```

### Pitfall 5: Password Shown in Network Tab

```tsx
// ❌ Security concern: Password visible in GET query params
fetch(`/api/login?email=${email}&password=${password}`)

// ✅ Always use POST with body for credentials
fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
```

### Debugging Tips

1. **Check localStorage**: Look for auth state in Application > Storage > Local Storage
2. **Network tab**: Verify login/logout requests and responses
3. **React DevTools**: Inspect Zustand store state
4. **Add logging to auth store**: Temporarily log state changes
   ```tsx
   const useAuthStore = create((set) => ({
     login: (data) => {
       console.log('Login:', data)
       set({ user: data.user, isAuthenticated: true })
     },
   }))
   ```

---

## Exercises

### Exercise 1: Remember Me

**Challenge**: Add a "Remember me" checkbox to the login form.

- When checked, persists session for 30 days
- When unchecked, session expires when browser closes

<details>
<summary>💡 Hints</summary>

1. Add a `rememberMe` checkbox to the login form
2. Pass the value to your login function
3. Conditionally use `sessionStorage` vs `localStorage` based on checkbox
4. Or set different expiration times for the persist middleware

```tsx
// Pattern: Custom storage based on rememberMe
const storage = rememberMe
  ? localStorage  // Persists across browser sessions
  : sessionStorage  // Cleared when browser closes
```

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] Checkbox displays on login form
- [ ] With "Remember me" checked, close and reopen browser - still logged in
- [ ] With "Remember me" unchecked, close and reopen browser - logged out
- [ ] Check localStorage/sessionStorage in DevTools to verify storage location

</details>

---

### Exercise 2: Password Reset

**Challenge**: Create a password reset flow.

- Forgot password page with email input
- Mock reset token generation
- Success message after submission

<details>
<summary>💡 Hints</summary>

1. Create `/forgot-password` route and page
2. Add a "Forgot password?" link on login page
3. Create a form with just email field
4. Mock the API to return success (no actual email sent)
5. Show success message: "If an account exists, we've sent a reset link"

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] "Forgot password?" link on login page navigates correctly
- [ ] Email validation works (invalid email shows error)
- [ ] Submit shows success message (even for non-existent emails for security)
- [ ] Loading state shows during submission
- [ ] Link back to login page works

</details>

---

### Exercise 3: Profile Page

**Challenge**: Create a profile page where users can view and update their information.

- Display current user info
- Form to update name
- Form to change password (current + new + confirm)

<details>
<summary>💡 Hints</summary>

1. Create `/profile` or `/settings` route
2. Pre-fill form with current user data from auth store
3. Create separate forms for profile update and password change
4. Add validation (new password must differ from current)
5. Update auth store on successful profile update

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] Current name and email display correctly
- [ ] Updating name saves and shows success message
- [ ] Password change validates current password
- [ ] New password and confirm must match
- [ ] Can't submit with same new password as current
- [ ] Updated name reflects in header/menu immediately

</details>

---

## Checkpoint

At this point, you should have:
- ✅ Login and registration forms
- ✅ Auth state management with Zustand
- ✅ Protected routes
- ✅ Session persistence
- ✅ User menu with logout

---

## Summary

In this module, we learned:
- Auth services handle login/register API calls
- Zustand with persist middleware stores auth state
- Protected routes guard authenticated content
- Public routes redirect logged-in users
- Session validation prevents expired tokens
- User menus provide account access

## Next Steps

In the final module, we'll polish the application and optimize performance.

[← Back to Module 10](../10-charts/README.md) | [Continue to Module 12: Polish & Optimization →](../12-polish/README.md)
