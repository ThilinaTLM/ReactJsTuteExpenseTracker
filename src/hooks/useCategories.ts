import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories'
import { toast } from '@/stores/useUIStore'
import type { Category, TransactionType } from '@/types'

const QUERY_KEY = 'categories'
const STALE_TIME = 1000 * 60 * 30 // 30 minutes (categories change less frequently)

/**
 * Hook to fetch all categories
 */
export function useCategories() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => categoriesService.getAll(),
    staleTime: STALE_TIME,
  })
}

/**
 * Hook to fetch a single category
 */
export function useCategory(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => categoriesService.getById(id),
    enabled: !!id,
    staleTime: STALE_TIME,
  })
}

/**
 * Hook to fetch categories by type
 */
export function useCategoriesByType(type: TransactionType) {
  const { data: categories, ...rest } = useCategories()

  return {
    ...rest,
    data: categories?.filter((c) => c.type === type),
  }
}

/**
 * Hook to get expense categories
 */
export function useExpenseCategories() {
  return useCategoriesByType('expense')
}

/**
 * Hook to get income categories
 */
export function useIncomeCategories() {
  return useCategoriesByType('income')
}

/**
 * Hook to create a category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Category, 'id'>) => categoriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Category created successfully')
    },
    onError: () => {
      toast.error('Failed to create category')
    },
  })
}

/**
 * Hook to update a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Omit<Category, 'id'>>) =>
      categoriesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Category updated successfully')
    },
    onError: () => {
      toast.error('Failed to update category')
    },
  })
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Category deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete category')
    },
  })
}

/**
 * Helper hook to get a category map for quick lookups
 */
export function useCategoryMap() {
  const { data: categories } = useCategories()

  if (!categories) return new Map<string, Category>()

  return new Map(categories.map((c) => [c.id, c]))
}
