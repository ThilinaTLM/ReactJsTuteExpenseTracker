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

## Exercises

### Exercise 1: Edit Transaction

Create an edit transaction flow with:
- Pre-populated form
- Update mutation with optimistic update
- Success/error feedback

### Exercise 2: Bulk Delete

Implement bulk delete with:
- Selection state
- Bulk delete mutation
- Optimistic removal of selected items

### Exercise 3: Undo Delete

Implement undo functionality:
- Show toast with "Undo" button after delete
- Restore item if undo is clicked within 5 seconds
- Actually delete after timeout

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
