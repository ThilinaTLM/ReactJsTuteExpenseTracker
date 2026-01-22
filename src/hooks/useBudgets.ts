import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetsService } from '@/services/budgets'
import { toast } from '@/stores/useUIStore'
import type { Budget, CreateBudgetInput, UpdateBudgetInput } from '@/types'

const QUERY_KEY = 'budgets'
const STALE_TIME = 1000 * 60 * 10 // 10 minutes

/**
 * Hook to fetch all budgets
 */
export function useBudgets() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => budgetsService.getAll(),
    staleTime: STALE_TIME,
  })
}

/**
 * Hook to fetch a single budget
 */
export function useBudget(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => budgetsService.getById(id),
    enabled: !!id,
    staleTime: STALE_TIME,
  })
}

/**
 * Hook to fetch budgets for a specific month
 */
export function useBudgetsByMonth(month: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'month', month],
    queryFn: () => budgetsService.getByMonth(month),
    enabled: !!month,
    staleTime: STALE_TIME,
  })
}

/**
 * Hook to create a budget
 */
export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBudgetInput) => budgetsService.create(data),
    onMutate: async (newBudget) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] })
      const previousBudgets = queryClient.getQueryData<Budget[]>([QUERY_KEY])

      if (previousBudgets) {
        const optimisticBudget: Budget = {
          id: 'temp-' + Date.now(),
          userId: '1',
          ...newBudget,
        }
        queryClient.setQueryData([QUERY_KEY], [...previousBudgets, optimisticBudget])
      }

      return { previousBudgets }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousBudgets) {
        queryClient.setQueryData([QUERY_KEY], context.previousBudgets)
      }
      toast.error('Failed to create budget')
    },
    onSuccess: () => {
      toast.success('Budget created successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

/**
 * Hook to update a budget
 */
export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateBudgetInput) => budgetsService.update(data),
    onMutate: async (updatedBudget) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] })
      const previousBudgets = queryClient.getQueryData<Budget[]>([QUERY_KEY])

      if (previousBudgets) {
        queryClient.setQueryData(
          [QUERY_KEY],
          previousBudgets.map((b) =>
            b.id === updatedBudget.id ? { ...b, ...updatedBudget } : b
          )
        )
      }

      return { previousBudgets }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousBudgets) {
        queryClient.setQueryData([QUERY_KEY], context.previousBudgets)
      }
      toast.error('Failed to update budget')
    },
    onSuccess: () => {
      toast.success('Budget updated successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

/**
 * Hook to delete a budget
 */
export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => budgetsService.delete(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] })
      const previousBudgets = queryClient.getQueryData<Budget[]>([QUERY_KEY])

      if (previousBudgets) {
        queryClient.setQueryData(
          [QUERY_KEY],
          previousBudgets.filter((b) => b.id !== deletedId)
        )
      }

      return { previousBudgets }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousBudgets) {
        queryClient.setQueryData([QUERY_KEY], context.previousBudgets)
      }
      toast.error('Failed to delete budget')
    },
    onSuccess: () => {
      toast.success('Budget deleted successfully')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}
