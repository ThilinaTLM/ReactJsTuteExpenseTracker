# Module 08: TanStack Query II - Mutations & Optimistic Updates

## Overview

In this module, we'll learn how to modify server data with mutations and implement optimistic updates for a snappy user experience. We'll complete the CRUD operations for our finance tracker.

## Learning Objectives

- Create mutations for data modification
- Invalidate and refetch queries after mutations
- Implement optimistic updates
- Handle mutation errors and rollbacks
- Build a complete CRUD interface

## Prerequisites

- Module 07 completed (TanStack Query I)
- Understanding of queries and caching

---

## 1. Understanding Mutations

### What are Mutations?

Mutations are operations that modify server data:
- **Create**: Add new records
- **Update**: Modify existing records
- **Delete**: Remove records

Unlike queries (which are declarative), mutations are imperative - you call them explicitly.

---

## 2. The useMutation Hook

### Basic Syntax

```tsx
import { useMutation } from '@tanstack/react-query'

const CreateTransaction = () => {
  const mutation = useMutation({
    mutationFn: (newTransaction: TransactionFormData) =>
      transactionsService.create(newTransaction),
  })

  const handleSubmit = (data: TransactionFormData) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      {mutation.isPending && <p>Creating...</p>}
      {mutation.isError && <p>Error: {mutation.error.message}</p>}
      {mutation.isSuccess && <p>Transaction created!</p>}
    </form>
  )
}
```

### Mutation Return Values

```tsx
const {
  mutate,         // Function to trigger mutation
  mutateAsync,    // Returns a Promise
  data,           // Result of successful mutation
  error,          // Error if mutation failed
  isPending,      // Mutation is in progress
  isError,        // Mutation failed
  isSuccess,      // Mutation succeeded
  isIdle,         // Mutation hasn't been called
  reset,          // Reset mutation state
  status,         // 'idle' | 'pending' | 'success' | 'error'
} = useMutation({ ... })
```

---

## 3. Mutation Callbacks

### onSuccess, onError, onSettled

```tsx
const mutation = useMutation({
  mutationFn: transactionsService.create,

  onMutate: (variables) => {
    // Called before mutation function
    console.log('About to create:', variables)
  },

  onSuccess: (data, variables, context) => {
    // Called on success
    console.log('Created:', data)
    showToast('Transaction created!')
  },

  onError: (error, variables, context) => {
    // Called on error
    console.error('Failed:', error)
    showToast('Failed to create transaction', 'error')
  },

  onSettled: (data, error, variables, context) => {
    // Called on success OR error (like finally)
    console.log('Mutation settled')
  },
})
```

### Callbacks at Call Site

```tsx
mutation.mutate(data, {
  onSuccess: (result) => {
    // This runs AFTER the mutation's onSuccess
    navigate(`/transactions/${result.id}`)
  },
  onError: (error) => {
    // Handle error at call site
    form.setError('root', { message: error.message })
  },
})
```

---

## 4. Query Invalidation

### Invalidating After Mutation

When data changes, related queries need to be refetched:

```tsx
import { useQueryClient, useMutation } from '@tanstack/react-query'

const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: transactionsService.create,

    onSuccess: () => {
      // Invalidate and refetch transactions list
      queryClient.invalidateQueries({
        queryKey: ['transactions'],
      })
    },
  })
}
```

### Invalidation Options

```tsx
// Invalidate exact match
queryClient.invalidateQueries({
  queryKey: ['transactions'],
  exact: true,
})

// Invalidate all that start with 'transactions'
queryClient.invalidateQueries({
  queryKey: ['transactions'],
})

// Invalidate with predicate
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey[0] === 'transactions' ||
    query.queryKey[0] === 'dashboard',
})

// Refetch immediately (instead of marking stale)
queryClient.refetchQueries({
  queryKey: ['transactions'],
})
```

---

## 5. Complete CRUD Hooks

### useTransactions with Mutations

```tsx
// src/hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsService } from '@/services/transactions'
import type { Transaction, TransactionFormData } from '@/types'

const QUERY_KEY = ['transactions']

export function useTransactions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: transactionsService.getAll,
  })
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => transactionsService.getById(id),
    enabled: !!id,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: transactionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransactionFormData> }) =>
      transactionsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, id] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: transactionsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
```

---

## 6. Optimistic Updates

### What are Optimistic Updates?

Optimistic updates immediately reflect changes in the UI before the server confirms them. If the server request fails, we roll back to the previous state.

### Benefits

- Instant feedback
- Better perceived performance
- Smooth user experience

### Implementing Optimistic Updates

```tsx
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: transactionsService.create,

    onMutate: async (newTransaction) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })

      // Snapshot previous value
      const previousTransactions = queryClient.getQueryData<Transaction[]>(QUERY_KEY)

      // Optimistically add to list
      const optimisticTransaction: Transaction = {
        ...newTransaction,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }

      queryClient.setQueryData<Transaction[]>(QUERY_KEY, (old) =>
        old ? [optimisticTransaction, ...old] : [optimisticTransaction]
      )

      // Return context for rollback
      return { previousTransactions }
    },

    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(QUERY_KEY, context.previousTransactions)
      }
    },

    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
```

### Optimistic Delete

```tsx
export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: transactionsService.delete,

    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })

      const previousTransactions = queryClient.getQueryData<Transaction[]>(QUERY_KEY)

      // Optimistically remove from list
      queryClient.setQueryData<Transaction[]>(QUERY_KEY, (old) =>
        old?.filter((t) => t.id !== deletedId) ?? []
      )

      return { previousTransactions }
    },

    onError: (_error, _variables, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(QUERY_KEY, context.previousTransactions)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
```

### Optimistic Update

```tsx
export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransactionFormData> }) =>
      transactionsService.update(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })

      const previousTransactions = queryClient.getQueryData<Transaction[]>(QUERY_KEY)

      // Optimistically update the item
      queryClient.setQueryData<Transaction[]>(QUERY_KEY, (old) =>
        old?.map((t) =>
          t.id === id ? { ...t, ...data } : t
        ) ?? []
      )

      return { previousTransactions }
    },

    onError: (_error, _variables, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(QUERY_KEY, context.previousTransactions)
      }
    },

    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, id] })
    },
  })
}
```

---

## 7. Using Mutations in Components

### Create Transaction Page

```tsx
// src/pages/Transactions/CreateTransaction.tsx
import { useNavigate } from 'react-router-dom'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useUIStore } from '@/stores/useUIStore'

export const CreateTransaction = () => {
  const navigate = useNavigate()
  const createTransaction = useCreateTransaction()
  const addToast = useUIStore((state) => state.addToast)

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      await createTransaction.mutateAsync(data)
      addToast({
        type: 'success',
        message: 'Transaction created successfully!',
      })
      navigate('/transactions')
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to create transaction',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/transactions')}
        />
      </CardContent>
    </Card>
  )
}
```

### Transaction Item with Delete

```tsx
// src/components/transactions/TransactionItem.tsx
import { useState } from 'react'
import { Trash2, Edit, MoreVertical } from 'lucide-react'
import { useDeleteTransaction } from '@/hooks/useTransactions'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Transaction } from '@/types'

interface TransactionItemProps {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
}

export const TransactionItem = ({ transaction, onEdit }: TransactionItemProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteTransaction = useDeleteTransaction()

  const handleDelete = async () => {
    try {
      await deleteTransaction.mutateAsync(transaction.id)
      setShowDeleteDialog(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const isExpense = transaction.type === 'expense'

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isExpense ? 'bg-danger-100 text-danger-600' : 'bg-success-100 text-success-600'
          }`}>
            {/* Category icon */}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              {transaction.description}
            </p>
            <p className="text-sm text-slate-500">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`font-semibold ${
            isExpense ? 'text-danger-600' : 'text-success-600'
          }`}>
            {isExpense ? '-' : '+'}${transaction.amount.toFixed(2)}
          </span>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(transaction)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 text-danger-500" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        isLoading={deleteTransaction.isPending}
      />
    </>
  )
}
```

---

## 8. Confirmation Dialog

```tsx
// src/components/ui/ConfirmDialog.tsx
import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: 'danger' | 'warning'
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
          variant === 'danger'
            ? 'bg-danger-100 text-danger-600'
            : 'bg-warning-100 text-warning-600'
        }`}>
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {message}
        </p>

        <div className="mt-6 flex gap-3 justify-center">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

---

## 9. Budget Mutations

```tsx
// src/hooks/useBudgets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetsService } from '@/services/budgets'

const QUERY_KEY = ['budgets']

export function useBudgets() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: budgetsService.getAll,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: budgetsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetFormData> }) =>
      budgetsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: budgetsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
```

---

## 10. Error Handling Patterns

### Global Error Handler

```tsx
// In QueryClient setup
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        // Global error handling
        if (error instanceof ApiError && error.status === 401) {
          // Redirect to login
          window.location.href = '/login'
        }
      },
    },
  },
})
```

### Per-Mutation Error Handling

```tsx
const createTransaction = useCreateTransaction()

const handleSubmit = async (data: FormData) => {
  try {
    await createTransaction.mutateAsync(data)
    // Success handling
  } catch (error) {
    if (error instanceof ValidationError) {
      // Handle validation errors
      Object.entries(error.errors).forEach(([field, message]) => {
        form.setError(field, { message })
      })
    } else {
      // Handle other errors
      showToast('Something went wrong', 'error')
    }
  }
}
```

---

## 11. Common Pitfalls & Debugging Tips

### Pitfall 1: Forgetting to Invalidate Related Queries

```tsx
// ❌ Bug: Dashboard stats still show old totals after creating transaction
const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      // Forgot to invalidate related data!
    },
  })
}

// ✅ Fix: Invalidate all affected queries
const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })  // Budget progress changes
      queryClient.invalidateQueries({ queryKey: ['stats'] })    // Dashboard stats change
    },
  })
}
```

### Pitfall 2: Optimistic Update Without Proper Rollback

```tsx
// ❌ Bug: No rollback on error leaves UI in inconsistent state
const useDeleteTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] })
      const previous = queryClient.getQueryData(['transactions'])

      queryClient.setQueryData(['transactions'], (old) =>
        old.filter(t => t.id !== id)
      )

      // Forgot to return context for rollback!
    },
    onError: (err, id, context) => {
      // context is undefined!
      queryClient.setQueryData(['transactions'], context?.previous)
    },
  })
}

// ✅ Fix: Return context from onMutate
const useDeleteTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] })
      const previous = queryClient.getQueryData(['transactions'])

      queryClient.setQueryData(['transactions'], (old) =>
        old.filter(t => t.id !== id)
      )

      return { previous }  // Return for rollback
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['transactions'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
```

### Pitfall 3: Using mutate() When You Need mutateAsync()

```tsx
// ❌ Bug: Can't await or catch errors
const handleSubmit = async (data) => {
  createMutation.mutate(data)  // Returns void
  navigate('/success')  // Navigates before mutation completes!
}

// ✅ Fix: Use mutateAsync for sequential operations
const handleSubmit = async (data) => {
  try {
    await createMutation.mutateAsync(data)  // Returns Promise
    navigate('/success')
  } catch (error) {
    // Handle error
  }
}

// Note: mutate() is fine when you handle results via callbacks
createMutation.mutate(data, {
  onSuccess: () => navigate('/success'),
  onError: (error) => showToast(error.message),
})
```

### Pitfall 4: Not Canceling Queries Before Optimistic Update

```tsx
// ❌ Bug: Race condition - old request might overwrite optimistic update
onMutate: async (newData) => {
  // Old in-flight request might resolve after optimistic update!
  const previous = queryClient.getQueryData(['transactions'])
  queryClient.setQueryData(['transactions'], (old) => [...old, newData])
  return { previous }
}

// ✅ Fix: Cancel outgoing queries first
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey: ['transactions'] })  // Cancel first!
  const previous = queryClient.getQueryData(['transactions'])
  queryClient.setQueryData(['transactions'], (old) => [...old, newData])
  return { previous }
}
```

### Pitfall 5: Showing Loading State During Optimistic Update

```tsx
// ❌ Poor UX: Shows loading spinner even with optimistic update
const TransactionItem = ({ transaction }) => {
  const deleteMutation = useDeleteTransaction()

  return (
    <div>
      {deleteMutation.isPending && <Spinner />}  {/* Unnecessary! */}
      <button
        onClick={() => deleteMutation.mutate(transaction.id)}
        disabled={deleteMutation.isPending}
      >
        Delete
      </button>
    </div>
  )
}

// ✅ Better: With optimistic updates, item is already removed from UI
// Only show loading for non-optimistic operations
const TransactionItem = ({ transaction }) => {
  const deleteMutation = useDeleteTransaction()

  // Item will be optimistically removed from parent list
  // No need for local loading state
  return (
    <div>
      <button onClick={() => deleteMutation.mutate(transaction.id)}>
        Delete
      </button>
    </div>
  )
}
```

### Debugging Tips

1. **Use React Query Devtools**: See mutation state, pending count, and errors
   ```tsx
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
   ```

2. **Log mutation lifecycle**:
   ```tsx
   useMutation({
     mutationFn: createTransaction,
     onMutate: (data) => console.log('Starting:', data),
     onSuccess: (result) => console.log('Success:', result),
     onError: (error) => console.log('Error:', error),
     onSettled: () => console.log('Settled'),
   })
   ```

3. **Check network tab**: Verify API calls are being made correctly

4. **Verify optimistic update shape**: Ensure the shape matches query data
   ```tsx
   onMutate: async (newTransaction) => {
     // Log the shape to compare
     console.log('Query data shape:', queryClient.getQueryData(['transactions']))
     console.log('New data shape:', newTransaction)
   }
   ```

---

## Exercises

### Exercise 1: Edit Transaction

**Challenge**: Create an edit transaction flow with optimistic updates.

Requirements:
- Pre-populated form with existing data
- Update mutation with optimistic update
- Success/error feedback via toast

<details>
<summary>💡 Hints</summary>

1. Fetch the transaction data to pre-populate the form
2. Use `defaultValues` in useForm (or `reset` when data loads)
3. Optimistic update should update the single item in the list

```tsx
// Pattern for optimistic update on edit:
onMutate: async (updatedTransaction) => {
  await queryClient.cancelQueries({ queryKey: ['transactions'] })
  const previous = queryClient.getQueryData(['transactions'])

  queryClient.setQueryData(['transactions'], (old) =>
    old.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
  )

  return { previous }
}
```

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] Form is pre-filled with existing transaction data
- [ ] Saving shows instant update (optimistic)
- [ ] Success toast appears after save
- [ ] Error rolls back to previous state
- [ ] Navigation back to list after save

</details>

---

### Exercise 2: Bulk Delete

**Challenge**: Implement bulk delete with selection and optimistic removal.

Requirements:
- Checkbox selection for multiple items
- "Delete Selected" button
- Optimistic removal of all selected items
- Confirmation dialog before deletion

<details>
<summary>💡 Hints</summary>

1. Store selected IDs in component state: `useState<Set<string>>(new Set())`
2. Create a mutation that accepts an array of IDs
3. Optimistic update filters out all selected items at once

```tsx
// Selection toggle:
const toggleSelect = (id: string) => {
  setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
}

// Optimistic update for bulk delete:
onMutate: async (ids: string[]) => {
  await queryClient.cancelQueries({ queryKey: ['transactions'] })
  const previous = queryClient.getQueryData(['transactions'])

  queryClient.setQueryData(['transactions'], (old) =>
    old.filter(t => !ids.includes(t.id))
  )

  return { previous }
}
```

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] Can select multiple transactions via checkbox
- [ ] "Delete Selected" button shows count
- [ ] Confirmation dialog appears before delete
- [ ] All selected items disappear immediately (optimistic)
- [ ] Selection clears after successful delete
- [ ] Error restores all items

</details>

---

### Exercise 3: Undo Delete

**Challenge**: Implement undo functionality with a timed soft-delete.

Requirements:
- Show toast with "Undo" button after delete
- Restore item if undo clicked within 5 seconds
- Permanently delete after timeout

<details>
<summary>💡 Hints</summary>

1. Don't call the API immediately - use a timeout
2. Store the deleted item temporarily
3. Clear timeout and restore if undo is clicked
4. Actually call delete API after timeout expires

```tsx
// Pattern:
const [pendingDelete, setPendingDelete] = useState<{
  item: Transaction
  timeoutId: ReturnType<typeof setTimeout>
} | null>(null)

const handleDelete = (item: Transaction) => {
  // Optimistically remove from UI
  queryClient.setQueryData(['transactions'], old =>
    old.filter(t => t.id !== item.id)
  )

  // Start timeout
  const timeoutId = setTimeout(() => {
    deleteTransaction.mutate(item.id)  // Actually delete
    setPendingDelete(null)
  }, 5000)

  setPendingDelete({ item, timeoutId })
  showToast({ message: 'Deleted', action: { label: 'Undo', onClick: handleUndo } })
}

const handleUndo = () => {
  if (pendingDelete) {
    clearTimeout(pendingDelete.timeoutId)
    // Restore item to cache
    queryClient.setQueryData(['transactions'], old => [...old, pendingDelete.item])
    setPendingDelete(null)
  }
}
```

</details>

<details>
<summary>✅ Verification</summary>

Test these scenarios:
- [ ] Item disappears immediately when deleted
- [ ] Toast appears with "Undo" button
- [ ] Clicking "Undo" within 5s restores the item
- [ ] Not clicking "Undo" permanently deletes after 5s
- [ ] Toast disappears after timeout
- [ ] Multiple deletes in quick succession work correctly

</details>

---

## Checkpoint

At this point, you should have:
- ✅ Understanding of mutations and their lifecycle
- ✅ Query invalidation after mutations
- ✅ Optimistic updates for instant feedback
- ✅ Complete CRUD operations for transactions
- ✅ Confirmation dialogs for destructive actions

---

## Summary

In this module, we learned:
- `useMutation` handles data modifications
- Callbacks (`onMutate`, `onSuccess`, `onError`, `onSettled`) control mutation lifecycle
- Query invalidation keeps data in sync
- Optimistic updates provide instant feedback
- Context from `onMutate` enables rollback on error
- Confirmation dialogs protect against accidental deletion

## Next Steps

In the next module, we'll learn about Zustand for managing global client state.

[← Back to Module 07](../07-tanstack-query-i/README.md) | [Continue to Module 09: Zustand →](../09-zustand/README.md)
