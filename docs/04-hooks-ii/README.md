# Module 04: React Hooks II - useRef, useMemo, useCallback & Custom Hooks

## Overview

In this module, we'll explore additional React hooks for performance optimization and DOM manipulation. We'll also learn how to create custom hooks to extract and share stateful logic.

## Learning Objectives

- Use `useRef` for DOM access and mutable values
- Optimize performance with `useMemo` and `useCallback`
- Understand React's reconciliation and when to optimize
- Create custom hooks to share logic between components

## Prerequisites

- Module 03 completed (useState and useEffect)
- Understanding of closures and references

---

## 1. The useRef Hook

### What is useRef?

`useRef` creates a mutable reference that persists across renders without causing re-renders when changed.

### Two Main Use Cases

1. **Accessing DOM elements**
2. **Storing mutable values that don't need re-renders**

### Accessing DOM Elements

```tsx
import { useRef, useEffect } from 'react'

const FocusInput = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus()
  }, [])

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="I'm focused on mount!"
    />
  )
}
```

### Storing Previous Values

```tsx
const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

// Usage
const Counter = () => {
  const [count, setCount] = useState(0)
  const prevCount = usePrevious(count)

  return (
    <div>
      <p>Current: {count}, Previous: {prevCount}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  )
}
```

### Ref vs State

| useRef | useState |
|--------|----------|
| Changes don't trigger re-render | Changes trigger re-render |
| Value persists between renders | Value persists between renders |
| Mutable (.current) | Immutable (use setter) |
| Synchronous updates | Batched updates |

### Storing Timer IDs

```tsx
const Stopwatch = () => {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = () => {
    if (intervalRef.current) return
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setTime(t => t + 1)
    }, 1000)
  }

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }

  const reset = () => {
    stop()
    setTime(0)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div>
      <p>Time: {time}s</p>
      <button onClick={isRunning ? stop : start}>
        {isRunning ? 'Stop' : 'Start'}
      </button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
```

---

## 2. The useMemo Hook

### What is useMemo?

`useMemo` caches the result of a calculation between re-renders.

```tsx
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b)
}, [a, b])
```

### When to Use useMemo

Use `useMemo` when:
- Computing a value is expensive
- The computed value is used in dependency arrays
- Passing complex objects to memoized children

### Expensive Calculation Example

```tsx
const TransactionStats = ({ transactions }: { transactions: Transaction[] }) => {
  // Without useMemo: recalculates on EVERY render
  // const stats = calculateStats(transactions)

  // With useMemo: only recalculates when transactions change
  const stats = useMemo(() => {
    console.log('Calculating stats...')

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      income,
      expenses,
      balance: income - expenses,
      count: transactions.length,
    }
  }, [transactions])

  return (
    <div>
      <p>Income: ${stats.income}</p>
      <p>Expenses: ${stats.expenses}</p>
      <p>Balance: ${stats.balance}</p>
    </div>
  )
}
```

### Filtering and Sorting

```tsx
const TransactionList = ({
  transactions,
  searchQuery,
  sortBy,
}: Props) => {
  const filteredAndSorted = useMemo(() => {
    let result = [...transactions]

    // Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.description.toLowerCase().includes(query)
      )
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      if (sortBy === 'amount') {
        return b.amount - a.amount
      }
      return 0
    })

    return result
  }, [transactions, searchQuery, sortBy])

  return (
    <ul>
      {filteredAndSorted.map(t => (
        <TransactionItem key={t.id} transaction={t} />
      ))}
    </ul>
  )
}
```

### Don't Overuse useMemo

```tsx
// ❌ Unnecessary - simple operation
const name = useMemo(() => firstName + ' ' + lastName, [firstName, lastName])

// ✅ Just do it directly
const name = firstName + ' ' + lastName

// ❌ Unnecessary - not expensive
const double = useMemo(() => count * 2, [count])

// ✅ Just calculate it
const double = count * 2
```

---

## 3. The useCallback Hook

### What is useCallback?

`useCallback` caches a function definition between re-renders.

```tsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b)
}, [a, b])
```

### Why useCallback?

In JavaScript, functions are recreated on every render:

```tsx
const Parent = () => {
  // New function created every render
  const handleClick = () => {
    console.log('clicked')
  }

  return <MemoizedChild onClick={handleClick} />
}
```

Even if `MemoizedChild` is wrapped with `React.memo`, it will re-render because `handleClick` is a new reference each time.

### useCallback Example

```tsx
import { useState, useCallback, memo } from 'react'

interface ItemProps {
  item: string
  onRemove: (item: string) => void
}

// Memoized child component
const Item = memo(({ item, onRemove }: ItemProps) => {
  console.log(`Rendering item: ${item}`)
  return (
    <li>
      {item}
      <button onClick={() => onRemove(item)}>Remove</button>
    </li>
  )
})

const ItemList = () => {
  const [items, setItems] = useState(['Apple', 'Banana', 'Cherry'])
  const [count, setCount] = useState(0)

  // Without useCallback: Item re-renders when count changes
  // const handleRemove = (item: string) => {
  //   setItems(prev => prev.filter(i => i !== item))
  // }

  // With useCallback: Item only re-renders when necessary
  const handleRemove = useCallback((item: string) => {
    setItems(prev => prev.filter(i => i !== item))
  }, [])

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <ul>
        {items.map(item => (
          <Item key={item} item={item} onRemove={handleRemove} />
        ))}
      </ul>
    </div>
  )
}
```

### useCallback with Dependencies

```tsx
const TransactionForm = ({ categoryId }: { categoryId: string }) => {
  const handleSubmit = useCallback((data: FormData) => {
    // categoryId is captured in the closure
    submitTransaction({ ...data, categoryId })
  }, [categoryId]) // Re-create when categoryId changes

  return <Form onSubmit={handleSubmit} />
}
```

### useMemo vs useCallback

```tsx
// These are equivalent:
const memoizedFn = useCallback(() => {
  doSomething()
}, [])

const memoizedFn = useMemo(() => {
  return () => {
    doSomething()
  }
}, [])
```

Use `useCallback` for functions, `useMemo` for values.

---

## 4. React.memo

### What is React.memo?

`React.memo` is a higher-order component that memoizes the rendered output, preventing re-renders if props haven't changed.

```tsx
const ExpensiveComponent = memo(({ data }: { data: Data }) => {
  // Only re-renders if data changes (shallow comparison)
  return <div>{/* render expensive UI */}</div>
})
```

### Complete Optimization Pattern

```tsx
import { useState, useCallback, useMemo, memo } from 'react'

interface Transaction {
  id: string
  description: string
  amount: number
}

interface TransactionItemProps {
  transaction: Transaction
  onDelete: (id: string) => void
}

// Memoized child component
const TransactionItem = memo(({ transaction, onDelete }: TransactionItemProps) => {
  console.log(`Rendering: ${transaction.id}`)
  return (
    <div className="flex justify-between">
      <span>{transaction.description}</span>
      <span>${transaction.amount}</span>
      <button onClick={() => onDelete(transaction.id)}>Delete</button>
    </div>
  )
})

const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState('')

  // Memoize filtered list
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t =>
      t.description.toLowerCase().includes(filter.toLowerCase())
    )
  }, [transactions, filter])

  // Memoize callback
  const handleDelete = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <div>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Filter..."
      />
      {filteredTransactions.map(t => (
        <TransactionItem
          key={t.id}
          transaction={t}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
```

---

## 5. Custom Hooks

### What are Custom Hooks?

Custom hooks let you extract component logic into reusable functions. They start with `use` and can call other hooks.

### Rules of Hooks

1. Only call hooks at the top level (not in loops, conditions, or nested functions)
2. Only call hooks from React functions (components or custom hooks)
3. Custom hooks must start with `use`

### Creating a Custom Hook

```tsx
// src/hooks/useToggle.ts
import { useState, useCallback } from 'react'

export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(v => !v)
  }, [])

  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse }
}

// Usage
const Modal = () => {
  const { value: isOpen, toggle, setFalse: close } = useToggle()

  return (
    <>
      <button onClick={toggle}>Open Modal</button>
      {isOpen && (
        <div className="modal">
          <button onClick={close}>Close</button>
        </div>
      )}
    </>
  )
}
```

### useDebounce Hook

```tsx
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// Usage
const Search = () => {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    if (debouncedQuery) {
      searchApi(debouncedQuery)
    }
  }, [debouncedQuery])

  return (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

### useLocalStorage Hook

```tsx
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react'

export const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error('useLocalStorage error:', error)
    }
  }

  return [storedValue, setValue]
}

// Usage
const Settings = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  return (
    <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      Theme: {theme}
    </button>
  )
}
```

### useMediaQuery Hook

```tsx
// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react'

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

// Usage
const ResponsiveComponent = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return isMobile ? <MobileLayout /> : <DesktopLayout />
}
```

### useFetch Hook

```tsx
// src/hooks/useFetch.ts
import { useState, useEffect } from 'react'

interface UseFetchResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export const useFetch = <T,>(url: string): UseFetchResult<T> => {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trigger, setTrigger] = useState(0)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const json = await response.json()
        if (!cancelled) {
          setData(json)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [url, trigger])

  const refetch = () => setTrigger(t => t + 1)

  return { data, isLoading, error, refetch }
}

// Usage
const TransactionList = () => {
  const { data, isLoading, error, refetch } = useFetch<Transaction[]>('/api/transactions')

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {data?.map(t => <TransactionItem key={t.id} transaction={t} />)}
    </div>
  )
}
```

---

## 6. Combining Hooks

### Complex Custom Hook Example

```tsx
// src/hooks/useTransactionFilters.ts
import { useState, useMemo, useCallback } from 'react'
import { useDebounce } from './useDebounce'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
}

interface Filters {
  search: string
  type: 'all' | 'income' | 'expense'
  category: string
  dateRange: { start: string; end: string } | null
}

export const useTransactionFilters = (transactions: Transaction[]) => {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: 'all',
    category: '',
    dateRange: null,
  })

  const debouncedSearch = useDebounce(filters.search, 300)

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Search filter
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase()
        if (!t.description.toLowerCase().includes(query)) {
          return false
        }
      }

      // Type filter
      if (filters.type !== 'all' && t.type !== filters.type) {
        return false
      }

      // Category filter
      if (filters.category && t.category !== filters.category) {
        return false
      }

      // Date range filter
      if (filters.dateRange) {
        const date = new Date(t.date)
        const start = new Date(filters.dateRange.start)
        const end = new Date(filters.dateRange.end)
        if (date < start || date > end) {
          return false
        }
      }

      return true
    })
  }, [transactions, debouncedSearch, filters.type, filters.category, filters.dateRange])

  const setSearch = useCallback((search: string) => {
    setFilters(f => ({ ...f, search }))
  }, [])

  const setType = useCallback((type: Filters['type']) => {
    setFilters(f => ({ ...f, type }))
  }, [])

  const setCategory = useCallback((category: string) => {
    setFilters(f => ({ ...f, category }))
  }, [])

  const setDateRange = useCallback((dateRange: Filters['dateRange']) => {
    setFilters(f => ({ ...f, dateRange }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      type: 'all',
      category: '',
      dateRange: null,
    })
  }, [])

  return {
    filters,
    filteredTransactions,
    setSearch,
    setType,
    setCategory,
    setDateRange,
    resetFilters,
  }
}
```

---

## Exercises

### Exercise 1: useClickOutside Hook

Create a hook that detects clicks outside an element:

```tsx
// Usage:
const Modal = () => {
  const ref = useRef(null)
  useClickOutside(ref, () => setIsOpen(false))

  return <div ref={ref}>Modal content</div>
}
```

### Exercise 2: useAsync Hook

Create a hook for handling async operations:

```tsx
// Usage:
const { execute, data, isLoading, error } = useAsync(fetchUser)

// Call execute when needed
<button onClick={() => execute(userId)}>Load User</button>
```

### Exercise 3: Optimize TransactionList

Take the transaction list and optimize it with:
- `useMemo` for filtering/sorting
- `useCallback` for event handlers
- `React.memo` for list items

---

## Checkpoint

At this point, you should have:
- ✅ Understanding of useRef for DOM access and mutable values
- ✅ Ability to optimize with useMemo and useCallback
- ✅ Knowledge of when (and when not) to optimize
- ✅ Ability to create custom hooks
- ✅ Understanding of React.memo

---

## Summary

In this module, we learned:
- `useRef` creates mutable references that persist without causing re-renders
- `useMemo` caches computed values between renders
- `useCallback` caches function definitions between renders
- `React.memo` prevents unnecessary re-renders of components
- Custom hooks let us extract and share stateful logic
- Don't optimize prematurely - measure first!

## Next Steps

In the next module, we'll learn about React Router for client-side navigation and building a multi-page application.

[← Back to Module 03](../03-hooks-i/README.md) | [Continue to Module 05: React Router →](../05-routing/README.md)
