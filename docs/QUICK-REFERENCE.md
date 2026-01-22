# React Quick Reference

A cheat sheet for common patterns used throughout this tutorial.

---

## Components

```tsx
// Function component with props
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

const Button = ({ children, onClick, variant = 'primary' }: ButtonProps) => {
  return (
    <button onClick={onClick} className={variant}>
      {children}
    </button>
  )
}
```

---

## Hooks

### useState
```tsx
const [count, setCount] = useState(0)
const [user, setUser] = useState<User | null>(null)

// Update with new value
setCount(5)

// Update based on previous value
setCount(prev => prev + 1)

// Update object (spread to keep other properties)
setUser(prev => ({ ...prev, name: 'New Name' }))
```

### useEffect
```tsx
// Run on mount only
useEffect(() => {
  console.log('Mounted')
}, [])

// Run when dependency changes
useEffect(() => {
  console.log('Count changed:', count)
}, [count])

// Cleanup on unmount
useEffect(() => {
  const handler = () => {}
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}, [])
```

### useRef
```tsx
// DOM reference
const inputRef = useRef<HTMLInputElement>(null)
inputRef.current?.focus()

// Mutable value (doesn't trigger re-render)
const timerRef = useRef<number | null>(null)
timerRef.current = setTimeout(() => {}, 1000)
```

### useMemo & useCallback
```tsx
// Memoize expensive calculation
const filtered = useMemo(() =>
  items.filter(i => i.name.includes(search)),
  [items, search]
)

// Memoize function reference
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

---

## React Router

```tsx
// Navigation
import { Link, NavLink, useNavigate } from 'react-router-dom'

<Link to="/about">About</Link>
<NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>

const navigate = useNavigate()
navigate('/dashboard')
navigate(-1)  // Go back

// Route params
import { useParams, useSearchParams } from 'react-router-dom'

const { id } = useParams<{ id: string }>()

const [searchParams, setSearchParams] = useSearchParams()
const page = searchParams.get('page') || '1'
setSearchParams({ page: '2' })
```

---

## React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Schema
const schema = z.object({
  email: z.string().email('Invalid email'),
  amount: z.coerce.number().positive('Must be positive'),
})

type FormData = z.infer<typeof schema>

// Form
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
  resolver: zodResolver(schema),
})

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('email')} />
  {errors.email && <span>{errors.email.message}</span>}
  <button disabled={isSubmitting}>Submit</button>
</form>
```

---

## TanStack Query

### Queries (fetching data)
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['transactions', filters],
  queryFn: () => api.getTransactions(filters),
  staleTime: 5 * 60 * 1000,  // 5 minutes
  enabled: !!userId,  // Only run if userId exists
})

// Always handle loading/error
if (isLoading) return <Spinner />
if (error) return <Error message={error.message} />
```

### Mutations (changing data)
```tsx
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: api.createTransaction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
  },
})

// Use it
mutation.mutate(newTransaction)
await mutation.mutateAsync(newTransaction)  // Returns promise
```

### Optimistic Updates
```tsx
const mutation = useMutation({
  mutationFn: api.deleteTransaction,
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['transactions'] })
    const previous = queryClient.getQueryData(['transactions'])
    queryClient.setQueryData(['transactions'], old =>
      old.filter(t => t.id !== id)
    )
    return { previous }
  },
  onError: (err, id, context) => {
    queryClient.setQueryData(['transactions'], context?.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
  },
})
```

---

## Zustand

```tsx
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Store {
  count: number
  increment: () => void
}

const useStore = create<Store>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    { name: 'my-store' }  // localStorage key
  )
)

// Use with selector (prevents unnecessary re-renders)
const count = useStore((state) => state.count)
const increment = useStore((state) => state.increment)

// Use outside React
useStore.getState().increment()
```

---

## Common Patterns

### Conditional Rendering
```tsx
// Ternary
{isLoggedIn ? <Dashboard /> : <Login />}

// Logical AND (careful with numbers!)
{items.length > 0 && <List items={items} />}

// Early return
if (isLoading) return <Spinner />
if (error) return <Error />
return <Content />
```

### List Rendering
```tsx
{items.map((item) => (
  <ListItem key={item.id} item={item} />  // Always use unique key!
))}
```

### Event Handlers
```tsx
// Click
<button onClick={() => handleClick(id)}>Click</button>

// Form submit
<form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>

// Input change
<input onChange={(e) => setName(e.target.value)} />
```

---

## TypeScript Tips

```tsx
// Component props
interface Props {
  required: string
  optional?: number
  children: React.ReactNode
  onClick: (id: string) => void
  variant: 'primary' | 'secondary'  // Union type
}

// Event types
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {}
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {}
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {}

// Ref types
const inputRef = useRef<HTMLInputElement>(null)
const divRef = useRef<HTMLDivElement>(null)
```

---

## Debugging Checklist

When something doesn't work:

1. **Check the console** for errors
2. **Check the Network tab** for failed API calls
3. **Use React DevTools** to inspect component props/state
4. **Add console.log** to trace execution flow
5. **Check dependency arrays** in useEffect/useMemo/useCallback
6. **Verify query keys** in TanStack Query DevTools
7. **Check for typos** in variable/function names

---

## VS Code Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + P` | Quick file open |
| `Cmd/Ctrl + Shift + P` | Command palette |
| `Cmd/Ctrl + D` | Select next occurrence |
| `Cmd/Ctrl + /` | Toggle comment |
| `F12` | Go to definition |
| `Shift + F12` | Find all references |
| `Cmd/Ctrl + .` | Quick fix / auto-import |
