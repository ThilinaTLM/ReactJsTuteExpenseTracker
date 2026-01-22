# Troubleshooting Guide

Common issues and their solutions when working through this tutorial.

---

## Setup Issues

### `npm install` fails

**Symptoms**: Errors during `npm install`

**Solutions**:
1. Delete `node_modules` and `package-lock.json`, then run `npm install` again
2. Check Node.js version: `node --version` (requires 18+)
3. Clear npm cache: `npm cache clean --force`

---

### Port already in use

**Symptoms**: "Port 5173 is already in use" or "Port 3001 is already in use"

**Solutions**:
1. Find and kill the process:
   ```bash
   # Find process using port 5173
   lsof -i :5173
   # Kill it
   kill -9 <PID>
   ```
2. Or use a different port:
   ```bash
   # Vite
   npm run dev -- --port 3000
   ```

---

### API not connecting

**Symptoms**: Network errors, "Failed to fetch", CORS errors

**Solutions**:
1. Make sure the API is running: `npm run api`
2. Check the API is on the right port: http://localhost:3001
3. Verify the Vite proxy is configured in `vite.config.ts`:
   ```ts
   server: {
     proxy: {
       '/api': 'http://localhost:3001'
     }
   }
   ```

---

## React Errors

### "X is not a function"

**Symptoms**: `TypeError: X is not a function`

**Common causes**:
1. **Forgot to destructure**: `const data = useQuery(...)` instead of `const { data } = useQuery(...)`
2. **Wrong import**: Importing default when named, or vice versa
3. **Stale closure**: Function captured old value

---

### "Cannot read property of undefined"

**Symptoms**: `TypeError: Cannot read property 'X' of undefined`

**Common causes**:
1. **Data not loaded yet**: Add loading check
   ```tsx
   // Bad
   return <div>{data.items.length}</div>

   // Good
   if (!data) return <Loading />
   return <div>{data.items.length}</div>
   ```
2. **Optional chaining missing**: Use `data?.items?.length`
3. **Wrong destructuring path**

---

### "Each child should have a unique key prop"

**Symptoms**: Warning in console about missing keys

**Solution**: Add unique `key` prop to list items:
```tsx
// Bad
{items.map(item => <Item item={item} />)}

// Good
{items.map(item => <Item key={item.id} item={item} />)}
```

---

### "Too many re-renders"

**Symptoms**: `Error: Too many re-renders. React limits the number of renders...`

**Common causes**:
1. **Calling setState in render**:
   ```tsx
   // Bad - infinite loop!
   const Component = () => {
     const [count, setCount] = useState(0)
     setCount(count + 1)  // Called every render!
   }

   // Good - only on event
   const Component = () => {
     const [count, setCount] = useState(0)
     return <button onClick={() => setCount(c => c + 1)}>+</button>
   }
   ```
2. **useEffect with wrong dependencies**
3. **Object/array in dependency causing infinite loop**

---

### Component not updating

**Symptoms**: State changes but UI doesn't update

**Common causes**:
1. **Mutating state directly**:
   ```tsx
   // Bad - mutates existing array
   items.push(newItem)
   setItems(items)

   // Good - creates new array
   setItems([...items, newItem])
   ```
2. **Using `useRef` when you need `useState`**
3. **Not using selector with Zustand**

---

## TypeScript Errors

### "Type 'X' is not assignable to type 'Y'"

**Solutions**:
1. Check the expected type and adjust your value
2. Use type assertion if you're sure: `value as ExpectedType`
3. Check for `null`/`undefined` handling

---

### "Property 'X' does not exist on type"

**Solutions**:
1. Check spelling of property name
2. Ensure the type definition includes the property
3. Use optional chaining for potentially undefined: `obj?.property`

---

### "Argument of type 'X' is not assignable to parameter of type 'Y'"

**Common with events**:
```tsx
// Error: event type wrong
const handleChange = (e: Event) => {}

// Fix: use React's event types
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {}
```

---

## TanStack Query Issues

### Query not fetching

**Check**:
1. Is `enabled` set to `false`?
2. Is the query key correct?
3. Is QueryClientProvider wrapping your app?
4. Check React Query DevTools for query status

---

### Stale data after mutation

**Solution**: Invalidate queries after mutation:
```tsx
const mutation = useMutation({
  mutationFn: createItem,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['items'] })
  },
})
```

---

### Optimistic update not working

**Check**:
1. Are you returning context from `onMutate`?
2. Is `onError` restoring the previous data?
3. Is the data shape correct?
4. Did you call `cancelQueries` before updating?

---

## React Router Issues

### Route not matching

**Check**:
1. Route order (more specific routes before catch-all)
2. Leading slashes consistency
3. Are routes wrapped in `<Routes>`?

---

### useParams returns undefined

**Check**:
1. Is the component inside a route with that param?
2. Is the param name spelled correctly? (case-sensitive)
3. Route definition: `/users/:id` → `useParams()` gives `{ id: "..." }`

---

## Form Issues (React Hook Form)

### Form not submitting

**Check**:
1. Button has `type="submit"`
2. Form has `onSubmit={handleSubmit(onSubmit)}`
3. Check validation errors: `console.log(errors)`

---

### Validation not working

**Check**:
1. Is `zodResolver` passed to `useForm`?
2. Is the schema correct? Test with `schema.safeParse(data)`
3. Is `mode` set correctly? (`onChange`, `onBlur`, `onSubmit`)

---

## Zustand Issues

### State not persisting

**Check**:
1. Is `persist` middleware applied?
2. Check localStorage in DevTools
3. Is `partialize` excluding the field?

---

### Component not re-rendering on state change

**Check**:
1. Are you using a selector? `useStore(state => state.value)`
2. Not using `getState()` in render (no subscription)
3. Is the state actually changing? (check DevTools)

---

## Still Stuck?

1. **Read the error message carefully** - it often tells you exactly what's wrong
2. **Check the browser console** - look for warnings too
3. **Use React DevTools** - inspect component props and state
4. **Use Network tab** - verify API requests/responses
5. **Add console.log** - trace execution flow
6. **Compare with working code** - check the reference implementation
7. **Take a break** - fresh eyes often spot the issue

---

## Getting Help

If you've tried everything above:
1. Search for the exact error message online
2. Check Stack Overflow for similar issues
3. Review the relevant module's "Common Pitfalls" section
4. Re-read the concepts section of the module
