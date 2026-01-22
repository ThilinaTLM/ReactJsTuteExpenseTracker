# Module 03: React Hooks I - useState and useEffect

## Overview

In this module, we'll learn about React's two most fundamental hooks: `useState` for managing component state and `useEffect` for handling side effects. These hooks are the foundation of interactive React applications.

## Learning Objectives

- Understand what state is and why it's needed
- Use `useState` to manage component state
- Understand the `useEffect` lifecycle hook
- Handle common side effects (data fetching, subscriptions)
- Clean up effects properly

## Prerequisites

- Module 02 completed (React basics)
- Understanding of components and props

---

## 1. Understanding State

### What is State?

State is data that changes over time and affects what the component renders. When state changes, React automatically re-renders the component to reflect the new state.

### State vs Props

| Props | State |
|-------|-------|
| Passed from parent | Managed within component |
| Read-only | Can be updated |
| External data | Internal data |
| Like function parameters | Like variables in a function |

### Why Do We Need State?

Regular variables don't trigger re-renders:

```tsx
// ❌ This won't work - no re-render
const Counter = () => {
  let count = 0

  const increment = () => {
    count++  // Variable changes but UI doesn't update
    console.log(count)  // Shows updated value
  }

  return (
    <div>
      <p>Count: {count}</p>  {/* Always shows 0 */}
      <button onClick={increment}>Increment</button>
    </div>
  )
}
```

---

## 2. The useState Hook

### Basic Syntax

```tsx
import { useState } from 'react'

const Counter = () => {
  const [count, setCount] = useState(0)
  //     ↑      ↑              ↑
  //   state  setter    initial value

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
```

### useState Returns an Array

```tsx
// Array destructuring
const [count, setCount] = useState(0)

// Equivalent to:
const stateArray = useState(0)
const count = stateArray[0]      // Current value
const setCount = stateArray[1]   // Setter function
```

### Different Data Types

```tsx
// Number
const [count, setCount] = useState(0)

// String
const [name, setName] = useState('')

// Boolean
const [isOpen, setIsOpen] = useState(false)

// Array
const [items, setItems] = useState<string[]>([])

// Object
const [user, setUser] = useState<User | null>(null)

// With TypeScript explicit type
const [transactions, setTransactions] = useState<Transaction[]>([])
```

### Updating State

#### Direct Updates
```tsx
setCount(5)           // Set to specific value
setIsOpen(true)       // Set boolean
setName('Alice')      // Set string
```

#### Functional Updates

When the new state depends on the previous state, use a function:

```tsx
// ❌ May not work correctly with batched updates
setCount(count + 1)

// ✅ Always correct
setCount(prevCount => prevCount + 1)
```

Why? React batches state updates for performance. If you click a button twice quickly, both updates might use the same "old" value of `count`.

#### Updating Objects

```tsx
const [user, setUser] = useState({ name: 'Alice', age: 25 })

// ❌ Mutating state directly (won't trigger re-render)
user.name = 'Bob'
setUser(user)

// ✅ Creating new object
setUser({ ...user, name: 'Bob' })

// ✅ Or with functional update
setUser(prev => ({ ...prev, name: 'Bob' }))
```

#### Updating Arrays

```tsx
const [items, setItems] = useState(['Apple', 'Banana'])

// Add item
setItems([...items, 'Cherry'])
setItems(prev => [...prev, 'Cherry'])

// Remove item
setItems(items.filter(item => item !== 'Banana'))

// Update item
setItems(items.map(item =>
  item === 'Apple' ? 'Green Apple' : item
))
```

---

## 3. Building Interactive Components

### Toggle Component

```tsx
const Toggle = () => {
  const [isOn, setIsOn] = useState(false)

  return (
    <button
      onClick={() => setIsOn(prev => !prev)}
      className={isOn ? 'bg-green-500' : 'bg-gray-500'}
    >
      {isOn ? 'ON' : 'OFF'}
    </button>
  )
}
```

### Form Input

```tsx
const SearchInput = () => {
  const [query, setQuery] = useState('')

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <p>Searching for: {query}</p>
    </div>
  )
}
```

### Transaction Type Toggle

Let's build a component for our finance tracker:

```tsx
type TransactionType = 'income' | 'expense'

const TransactionTypeToggle = () => {
  const [type, setType] = useState<TransactionType>('expense')

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setType('expense')}
        className={cn(
          'px-4 py-2 rounded-lg',
          type === 'expense'
            ? 'bg-danger-500 text-white'
            : 'bg-slate-200 text-slate-700'
        )}
      >
        Expense
      </button>
      <button
        onClick={() => setType('income')}
        className={cn(
          'px-4 py-2 rounded-lg',
          type === 'income'
            ? 'bg-success-500 text-white'
            : 'bg-slate-200 text-slate-700'
        )}
      >
        Income
      </button>
    </div>
  )
}
```

---

## 4. The useEffect Hook

### What is useEffect?

`useEffect` lets you perform side effects in function components. Side effects are operations that affect something outside the component:

- Data fetching
- Subscriptions
- DOM manipulation
- Timers
- Logging

### Basic Syntax

```tsx
import { useEffect } from 'react'

useEffect(() => {
  // Effect code runs after render
  console.log('Component rendered!')
})
```

### Dependency Array

The dependency array controls when the effect runs:

```tsx
// Runs after EVERY render
useEffect(() => {
  console.log('Runs every time')
})

// Runs ONCE after initial render
useEffect(() => {
  console.log('Runs once on mount')
}, [])

// Runs when dependencies change
useEffect(() => {
  console.log('Count changed to:', count)
}, [count])

// Multiple dependencies
useEffect(() => {
  console.log('Either changed')
}, [count, name])
```

### Effect Lifecycle

```tsx
const Component = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('Effect runs')

    return () => {
      console.log('Cleanup runs')
    }
  }, [count])

  // Timeline:
  // 1. Component mounts → Effect runs
  // 2. count changes → Cleanup runs → Effect runs
  // 3. Component unmounts → Cleanup runs
}
```

---

## 5. Common useEffect Patterns

### Data Fetching

```tsx
const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/transactions')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setTransactions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, []) // Empty array = run once on mount

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <ul>
      {transactions.map(t => (
        <li key={t.id}>{t.description}</li>
      ))}
    </ul>
  )
}
```

### Document Title

```tsx
const Dashboard = () => {
  const [balance, setBalance] = useState(12450)

  useEffect(() => {
    document.title = `Balance: $${balance.toLocaleString()}`

    // Cleanup: restore original title
    return () => {
      document.title = 'FinTrack'
    }
  }, [balance])

  return <h1>Balance: ${balance}</h1>
}
```

### Event Listeners

```tsx
const WindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)

    // Cleanup: remove listener
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, []) // Empty array = set up once

  return (
    <p>Window: {size.width} x {size.height}</p>
  )
}
```

### Timers

```tsx
const Timer = () => {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)

    // Cleanup: clear interval
    return () => {
      clearInterval(interval)
    }
  }, [isRunning])

  return (
    <div>
      <p>Seconds: {seconds}</p>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? 'Stop' : 'Start'}
      </button>
    </div>
  )
}
```

### Local Storage Sync

```tsx
const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

// Usage
const Settings = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  )
}
```

---

## 6. useEffect Best Practices

### Avoid Infinite Loops

```tsx
// ❌ Infinite loop - effect runs, updates state, triggers effect again
useEffect(() => {
  setCount(count + 1)
}, [count])

// ❌ Missing dependency causes stale closure
useEffect(() => {
  const interval = setInterval(() => {
    setCount(count + 1)  // Always uses initial count value
  }, 1000)
  return () => clearInterval(interval)
}, [])

// ✅ Correct - use functional update
useEffect(() => {
  const interval = setInterval(() => {
    setCount(prev => prev + 1)
  }, 1000)
  return () => clearInterval(interval)
}, [])
```

### Separate Concerns

```tsx
// ✅ Separate effects for separate concerns
useEffect(() => {
  document.title = `Count: ${count}`
}, [count])

useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false)
  }
  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [])
```

### Cleanup is Important

Always clean up subscriptions, timers, and event listeners:

```tsx
useEffect(() => {
  const subscription = api.subscribe(data => {
    setData(data)
  })

  return () => {
    subscription.unsubscribe()  // Prevent memory leaks
  }
}, [])
```

---

## 7. Building the Theme Toggle

Let's combine `useState` and `useEffect` to build a theme toggle for our app:

```tsx
// src/hooks/useTheme.ts
import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('theme') as Theme
    if (stored) return stored

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  })

  useEffect(() => {
    // Update document class
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return { theme, setTheme, toggleTheme }
}
```

```tsx
// src/components/ui/ThemeToggle.tsx
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from './Button'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  )
}
```

---

## Exercises

### Exercise 1: Counter with Multiple Actions

Build a counter with increment, decrement, and reset buttons:

```tsx
// Features:
// - Display current count
// - Increment button (+1)
// - Decrement button (-1)
// - Reset button (back to 0)
// - Don't allow negative numbers
```

### Exercise 2: Character Counter Input

Build an input that shows remaining characters:

```tsx
// Features:
// - Text input with max 280 characters
// - Display "X characters remaining"
// - Change color to warning (yellow) at 20 remaining
// - Change color to danger (red) at 0 remaining
// - Disable typing when limit reached
```

### Exercise 3: Auto-Save Notes

Build a notes component that auto-saves to localStorage:

```tsx
// Features:
// - Textarea for notes
// - Auto-save to localStorage after 1 second of no typing
// - Show "Saving..." indicator while debouncing
// - Show "Saved" after successful save
// - Load saved notes on mount
```

---

## Checkpoint

At this point, you should have:
- ✅ Understanding of state and why it's needed
- ✅ Ability to use useState with different data types
- ✅ Knowledge of updating state correctly (immutably)
- ✅ Understanding of useEffect and its dependency array
- ✅ Ability to handle side effects and cleanup
- ✅ Created a theme toggle feature

---

## Summary

In this module, we learned:
- State is data that changes over time and triggers re-renders
- `useState` returns a state value and setter function
- Always update state immutably (create new objects/arrays)
- Use functional updates when new state depends on previous state
- `useEffect` handles side effects after render
- The dependency array controls when effects run
- Always clean up subscriptions, timers, and event listeners

## Next Steps

In the next module, we'll explore more React hooks including `useRef`, `useMemo`, `useCallback`, and learn how to create custom hooks.

[← Back to Module 02](../02-react-basics/README.md) | [Continue to Module 04: React Hooks II →](../04-hooks-ii/README.md)
