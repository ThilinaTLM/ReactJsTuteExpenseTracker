import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { transactionsService } from '@/services/transactions'
import { toast } from '@/stores/useUIStore'
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
} from '@/types'

const QUERY_KEY = 'transactions'
const STALE_TIME = 1000 * 60 * 5 // 5 minutes

/**
 * Hook to fetch all transactions with filtering
 */
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => transactionsService.getAll(filters),
    staleTime: STALE_TIME,
  })
}

/**
 * Hook to fetch a single transaction
 */
export function useTransaction(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => transactionsService.getById(id),
    enabled: !!id,
    staleTime: STALE_TIME,
  })
}

/**
 * Hook to fetch recent transactions
 */
export function useRecentTransactions(limit: number = 5) {
  return useQuery({
    queryKey: [QUERY_KEY, 'recent', limit],
    queryFn: () => transactionsService.getRecent(limit),
    staleTime: STALE_TIME,
  })
}

/**
 * Hook to fetch current month transactions
 */
export function useCurrentMonthTransactions() {
  return useQuery({
    queryKey: [QUERY_KEY, 'currentMonth'],
    queryFn: () => transactionsService.getCurrentMonthTransactions(),
    staleTime: STALE_TIME,
  })
}

/**
 * Hook to fetch transactions with infinite scroll
 */
export function useInfiniteTransactions(filters?: TransactionFilters, limit: number = 10) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      transactionsService.getAll({ ...filters, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, page) => sum + page.data.length, 0)
      if (totalFetched >= lastPage.total) return undefined
      return allPages.length + 1
    },
    staleTime: STALE_TIME,
  })
}

/**
 * Hook to create a transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransactionInput) => transactionsService.create(data),
    onMutate: async (newTransaction) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] })

      // Snapshot the previous value
      const previousTransactions = queryClient.getQueryData<{ data: Transaction[] }>([QUERY_KEY])

      // Optimistically update
      if (previousTransactions) {
        const optimisticTransaction: Transaction = {
          id: 'temp-' + Date.now(),
          userId: '1',
          ...newTransaction,
          createdAt: new Date().toISOString(),
        }
        queryClient.setQueryData([QUERY_KEY], {
          ...previousTransactions,
          data: [optimisticTransaction, ...previousTransactions.data],
        })
      }

      return { previousTransactions }
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData([QUERY_KEY], context.previousTransactions)
      }
      toast.error('Failed to create transaction')
    },
    onSuccess: () => {
      toast.success('Transaction created successfully')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

/**
 * Hook to update a transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateTransactionInput) => transactionsService.update(data),
    onMutate: async (updatedTransaction) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] })

      const previousTransactions = queryClient.getQueryData<{ data: Transaction[] }>([QUERY_KEY])

      if (previousTransactions) {
        queryClient.setQueryData([QUERY_KEY], {
          ...previousTransactions,
          data: previousTransactions.data.map((t) =>
            t.id === updatedTransaction.id ? { ...t, ...updatedTransaction } : t
          ),
        })
      }

      return { previousTransactions }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData([QUERY_KEY], context.previousTransactions)
      }
      toast.error('Failed to update transaction')
    },
    onSuccess: () => {
      toast.success('Transaction updated successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

/**
 * Hook to delete a transaction
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] })

      const previousTransactions = queryClient.getQueryData<{ data: Transaction[] }>([QUERY_KEY])

      if (previousTransactions) {
        queryClient.setQueryData([QUERY_KEY], {
          ...previousTransactions,
          data: previousTransactions.data.filter((t) => t.id !== deletedId),
        })
      }

      return { previousTransactions }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData([QUERY_KEY], context.previousTransactions)
      }
      toast.error('Failed to delete transaction')
    },
    onSuccess: () => {
      toast.success('Transaction deleted successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}
