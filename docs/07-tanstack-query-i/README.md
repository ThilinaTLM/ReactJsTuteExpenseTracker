# Module 07: TanStack Query I - Data Fetching

## Overview

In this module, we'll learn how to manage server state with TanStack Query (formerly React Query). We'll set up queries for fetching data and understand the powerful caching and synchronization features.

## Learning Objectives

- Understand server state vs client state
- Set up TanStack Query in your application
- Create queries for data fetching
- Handle loading, error, and success states
- Understand query caching and stale time

## Prerequisites

- Module 06 completed (Forms & Validation)
- Understanding of async/await and Promises

---

## 1. Server State vs Client State

### Client State

Data that exists only in the browser:
- UI state (modal open/closed, selected tab)
- Form input values
- Theme preference
- Filters and sorting

### Server State

Data that originates from a server:
- User data
- Transactions
- Categories
- Budgets

### Why TanStack Query?

Managing server state is complex because it:
- Is persisted remotely
- Requires async APIs
- Can become stale
- May be shared across components
- Needs caching for performance
- Requires background updates

TanStack Query handles all of this automatically.

---

## 2. Setting Up TanStack Query

### Installation

```bash
npm install @tanstack/react-query
```

### Provider Setup

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)
```

### Query Client Options Explained

- `staleTime`: How long data is considered fresh (won't refetch)
- `gcTime`: How long inactive data stays in cache
- `retry`: Number of retry attempts on failure
- `refetchOnWindowFocus`: Refetch when window regains focus

---

## 3. Creating API Services

### API Client

```tsx
// src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  put<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  patch<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiClient(API_URL)
```

### Transactions Service

```tsx
// src/services/transactions.ts
import { api } from './api'
import type { Transaction, TransactionFormData } from '@/types'

export const transactionsService = {
  getAll: () => api.get<Transaction[]>('/transactions'),

  getById: (id: string) => api.get<Transaction>(`/transactions/${id}`),

  create: (data: TransactionFormData) =>
    api.post<Transaction>('/transactions', {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }),

  update: (id: string, data: Partial<TransactionFormData>) =>
    api.patch<Transaction>(`/transactions/${id}`, data),

  delete: (id: string) => api.delete<void>(`/transactions/${id}`),
}
```

---

## 4. Basic Queries with useQuery

### The useQuery Hook

```tsx
import { useQuery } from '@tanstack/react-query'
import { transactionsService } from '@/services/transactions'

const TransactionList = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsService.getAll,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <ul>
      {data?.map((transaction) => (
        <li key={transaction.id}>{transaction.description}</li>
      ))}
    </ul>
  )
}
```

### Query Keys

Query keys uniquely identify queries for caching:

```tsx
// Simple key
['transactions']

// With ID
['transactions', transactionId]

// With filters
['transactions', { type: 'expense', category: 'food' }]

// Nested structure
['users', userId, 'transactions']
```

### Return Values

```tsx
const {
  data,              // The query result
  error,             // Error object if failed
  isLoading,         // First load, no data yet
  isFetching,        // Any fetch in progress
  isError,           // Query failed
  isSuccess,         // Query succeeded
  status,            // 'pending' | 'error' | 'success'
  fetchStatus,       // 'fetching' | 'paused' | 'idle'
  refetch,           // Function to refetch
  dataUpdatedAt,     // Timestamp of last successful fetch
} = useQuery({ ... })
```

---

## 5. Creating Custom Query Hooks

### useTransactions Hook

```tsx
// src/hooks/useTransactions.ts
import { useQuery } from '@tanstack/react-query'
import { transactionsService } from '@/services/transactions'
import type { Transaction } from '@/types'

export const TRANSACTIONS_QUERY_KEY = ['transactions']

export function useTransactions() {
  return useQuery({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: transactionsService.getAll,
  })
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, id],
    queryFn: () => transactionsService.getById(id),
    enabled: !!id, // Only fetch if ID exists
  })
}
```

### useCategories Hook

```tsx
// src/hooks/useCategories.ts
import { useQuery } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories'

export const CATEGORIES_QUERY_KEY = ['categories']

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: categoriesService.getAll,
    staleTime: Infinity, // Categories rarely change
  })
}
```

### useBudgets Hook

```tsx
// src/hooks/useBudgets.ts
import { useQuery } from '@tanstack/react-query'
import { budgetsService } from '@/services/budgets'

export const BUDGETS_QUERY_KEY = ['budgets']

export function useBudgets() {
  return useQuery({
    queryKey: BUDGETS_QUERY_KEY,
    queryFn: budgetsService.getAll,
  })
}
```

---

## 6. Query Options

### Stale Time

```tsx
useQuery({
  queryKey: ['categories'],
  queryFn: fetchCategories,
  staleTime: 1000 * 60 * 60, // Data is fresh for 1 hour
})
```

### Enabled

Conditionally enable/disable queries:

```tsx
const { data: user } = useQuery({ queryKey: ['user'], queryFn: fetchUser })

// Only fetch transactions after user is loaded
const { data: transactions } = useQuery({
  queryKey: ['transactions', user?.id],
  queryFn: () => fetchUserTransactions(user!.id),
  enabled: !!user, // false until user exists
})
```

### Retry

```tsx
useQuery({
  queryKey: ['transactions'],
  queryFn: fetchTransactions,
  retry: 3,                    // Retry 3 times
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
})
```

### Refetch Intervals

```tsx
useQuery({
  queryKey: ['balance'],
  queryFn: fetchBalance,
  refetchInterval: 1000 * 60, // Refetch every minute
  refetchIntervalInBackground: false, // Only when tab is active
})
```

### Select (Transform Data)

```tsx
const { data: expenseTotal } = useQuery({
  queryKey: ['transactions'],
  queryFn: fetchTransactions,
  select: (transactions) =>
    transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
})
```

---

## 7. Loading and Error States

### Loading Skeleton

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

// Usage
const TransactionSkeleton = () => (
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
```

### Error Display

```tsx
// src/components/ui/ErrorMessage.tsx
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-danger-600" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
        Something went wrong
      </h3>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          className="mt-4"
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Try Again
        </Button>
      )}
    </div>
  )
}
```

### Complete Component

```tsx
const TransactionList = () => {
  const { data, isLoading, isError, error, refetch } = useTransactions()

  if (isLoading) {
    return <TransactionSkeleton />
  }

  if (isError) {
    return (
      <ErrorMessage
        message={error.message}
        onRetry={() => refetch()}
      />
    )
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Add your first transaction to get started."
        action={<Button>Add Transaction</Button>}
      />
    )
  }

  return (
    <ul className="space-y-2">
      {data.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}
    </ul>
  )
}
```

---

## 8. Dependent Queries

### Sequential Queries

```tsx
const Dashboard = () => {
  // First query
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  })

  // Dependent query - only runs when user is available
  const { data: transactions } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => fetchUserTransactions(user!.id),
    enabled: !!user,
  })

  // Another dependent query
  const { data: budgets } = useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: () => fetchUserBudgets(user!.id),
    enabled: !!user,
  })

  return (
    <div>
      {user && (
        <>
          <TransactionList transactions={transactions} />
          <BudgetList budgets={budgets} />
        </>
      )}
    </div>
  )
}
```

### Parallel Queries with useQueries

```tsx
import { useQueries } from '@tanstack/react-query'

const MultipleTransactions = ({ ids }: { ids: string[] }) => {
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['transactions', id],
      queryFn: () => transactionsService.getById(id),
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const transactions = results
    .filter((r) => r.isSuccess)
    .map((r) => r.data)

  if (isLoading) return <div>Loading...</div>

  return (
    <ul>
      {transactions.map((t) => (
        <li key={t.id}>{t.description}</li>
      ))}
    </ul>
  )
}
```

---

## 9. Prefetching

### Prefetch on Hover

```tsx
import { useQueryClient } from '@tanstack/react-query'

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const queryClient = useQueryClient()

  const prefetchDetails = () => {
    queryClient.prefetchQuery({
      queryKey: ['transactions', transaction.id],
      queryFn: () => transactionsService.getById(transaction.id),
    })
  }

  return (
    <Link
      to={`/transactions/${transaction.id}`}
      onMouseEnter={prefetchDetails}
    >
      {transaction.description}
    </Link>
  )
}
```

### Prefetch on Route

```tsx
// In your router loader
const transactionLoader = async ({ params }) => {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['transactions', params.id],
    queryFn: () => transactionsService.getById(params.id),
  })

  return null
}
```

---

## 10. Using Queries in the Dashboard

```tsx
// src/pages/Dashboard.tsx
import { useTransactions } from '@/hooks/useTransactions'
import { useBudgets } from '@/hooks/useBudgets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export const Dashboard = () => {
  const { data: transactions, isLoading: loadingTransactions } = useTransactions()
  const { data: budgets, isLoading: loadingBudgets } = useBudgets()

  const stats = useMemo(() => {
    if (!transactions) return null

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      income,
      expenses,
      balance: income - expenses,
    }
  }, [transactions])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loadingTransactions ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Balance"
              value={stats?.balance ?? 0}
              type="balance"
            />
            <StatCard
              title="Income"
              value={stats?.income ?? 0}
              type="income"
            />
            <StatCard
              title="Expenses"
              value={stats?.expenses ?? 0}
              type="expense"
            />
          </>
        )}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <TransactionSkeleton count={5} />
          ) : (
            <TransactionList
              transactions={transactions?.slice(0, 5) ?? []}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 11. Common Pitfalls & Debugging Tips

### Pitfall 1: Query Key Mismatch

```tsx
// ❌ Bug: Different query keys = different caches
useQuery({
  queryKey: ['transactions'],  // Component A uses this
  queryFn: fetchTransactions,
})

useQuery({
  queryKey: ['all-transactions'],  // Component B uses this - separate cache!
  queryFn: fetchTransactions,
})

// ✅ Fix: Use consistent query keys (ideally from a factory)
const queryKeys = {
  all: ['transactions'] as const,
  byId: (id: string) => ['transactions', id] as const,
  byUser: (userId: string) => ['transactions', 'user', userId] as const,
}

// Both components now share the same cache
useQuery({
  queryKey: queryKeys.all,
  queryFn: fetchTransactions,
})
```

### Pitfall 2: Forgetting to Handle Loading/Error States

```tsx
// ❌ Bug: data might be undefined on first render
const { data } = useTransactions()
return <div>{data.length} transactions</div>  // 💥 Crash!

// ✅ Fix: Always handle loading and error states
const { data, isLoading, isError } = useTransactions()

if (isLoading) return <Skeleton />
if (isError) return <ErrorMessage />
if (!data) return <EmptyState />

return <div>{data.length} transactions</div>
```

### Pitfall 3: Not Using `enabled` for Conditional Queries

```tsx
// ❌ Bug: Query runs immediately, even when userId is undefined
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId!),  // Danger: userId could be undefined!
})

// ✅ Fix: Use enabled to prevent premature execution
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId!),
  enabled: !!userId,  // Only runs when userId exists
})
```

### Pitfall 4: Stale Data After Mutation

```tsx
// ❌ Bug: Cache not updated after creating transaction
const createMutation = useMutation({
  mutationFn: createTransaction,
  onSuccess: () => {
    // Forgot to invalidate! List still shows old data
  },
})

// ✅ Fix: Invalidate related queries
const createMutation = useMutation({
  mutationFn: createTransaction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
  },
})
```

### Pitfall 5: Query Function Not Throwing on Error

```tsx
// ❌ Bug: fetch doesn't throw on HTTP errors
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: async () => {
    const response = await fetch('/api/data')
    return response.json()  // Returns error response as "success"!
  },
})

// ✅ Fix: Check response status and throw
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: async () => {
    const response = await fetch('/api/data')
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }
    return response.json()
  },
})
```

### Debugging Tips

1. **Install React Query Devtools**: Essential for debugging queries
   ```tsx
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

   // In your App component
   <QueryClientProvider client={queryClient}>
     <App />
     <ReactQueryDevtools initialIsOpen={false} />
   </QueryClientProvider>
   ```

2. **Check the Devtools panel for**:
   - Query status (fresh, stale, fetching, inactive)
   - Cached data
   - Query key structure
   - Number of observers (components using the query)

3. **Common issues to check**:
   - Is the query key correct?
   - Is `enabled` preventing the query from running?
   - Is the data being cached but appearing stale?
   - Did a mutation invalidate the correct queries?

4. **Enable query logging during development**:
   ```tsx
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         // Log all query events in development
         onError: (error) => console.error('Query error:', error),
       },
     },
   })
   ```

---

## Exercises

### Exercise 1: Categories Query

**Challenge**: Create a `useCategories` hook optimized for rarely-changing data.

Requirements:
- Fetches all categories from API
- Has infinite stale time (categories rarely change)
- Provides a `getCategoryById` helper function

<details>
<summary>💡 Hints</summary>

1. Set `staleTime: Infinity` to prevent background refetches
2. Use `useMemo` for the `getCategoryById` helper
3. The helper should return undefined if not found

```tsx
// Pattern:
const useCategories = () => {
  const query = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
    staleTime: Infinity,  // Never consider stale
  })

  const getCategoryById = useMemo(() => {
    return (id: string) => query.data?.find(c => c.id === id)
  }, [query.data])

  return { ...query, getCategoryById }
}
```

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] Categories load on first mount
- [ ] Navigating away and back doesn't refetch (check Network tab)
- [ ] `getCategoryById` returns correct category
- [ ] `getCategoryById` returns undefined for invalid ID

</details>

---

### Exercise 2: Filtered Transactions

**Challenge**: Create a `useFilteredTransactions` hook that accepts filter parameters and includes them in the query key.

Requirements:
- Accept filter object as parameter
- Include filters in query key (so different filters = different cache entries)
- Pass filters to API (if your API supports filtering)

<details>
<summary>💡 Hints</summary>

1. Include filter values in the query key
2. Pass filters to your query function
3. Only include defined filters in the key

```tsx
// Pattern:
const useFilteredTransactions = (filters: Filters) => {
  return useQuery({
    queryKey: ['transactions', filters],  // Filters in key!
    queryFn: () => transactionsService.getAll(filters),
    // Optionally filter client-side if API doesn't support:
    select: (data) => data.filter(/* ... */),
  })
}
```

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] Changing filter refetches data (or filters client-side)
- [ ] Going back to previous filter uses cached data
- [ ] Empty filters work correctly
- [ ] Query key in DevTools shows filter values

</details>

---

### Exercise 3: Dashboard Stats

**Challenge**: Create a `useDashboardStats` hook that derives statistics from transaction data.

Requirements:
- Reuse the transactions query (don't fetch twice)
- Calculate total income, expenses, and balance
- Memoize the calculation

<details>
<summary>💡 Hints</summary>

1. Use `useTransactions` internally (don't create new query)
2. Use `useMemo` to avoid recalculating on every render
3. Handle the case when data is undefined

```tsx
// Pattern:
const useDashboardStats = () => {
  const { data: transactions, ...rest } = useTransactions()

  const stats = useMemo(() => {
    if (!transactions) return null

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    // ... calculate expenses, balance

    return { income, expenses, balance }
  }, [transactions])

  return { ...rest, stats }
}
```

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] Stats calculate correctly from transaction data
- [ ] Adding a transaction updates the stats
- [ ] Loading state works while data is fetching
- [ ] Calculation only runs when transactions change (add console.log)

</details>

---

## Checkpoint

At this point, you should have:
- ✅ TanStack Query set up with provider
- ✅ API services created
- ✅ Custom query hooks for transactions, categories, budgets
- ✅ Loading and error state handling
- ✅ Understanding of query keys and caching

---

## Summary

In this module, we learned:
- Server state differs from client state and needs special handling
- TanStack Query manages caching, syncing, and updates automatically
- `useQuery` hook fetches and caches data
- Query keys uniquely identify cached data
- Query options control caching behavior
- Dependent queries can chain data fetching
- Prefetching improves perceived performance

## Next Steps

In the next module, we'll learn about mutations for creating, updating, and deleting data, along with optimistic updates.

[← Back to Module 06](../06-forms/README.md) | [Continue to Module 08: TanStack Query II →](../08-tanstack-query-ii/README.md)
