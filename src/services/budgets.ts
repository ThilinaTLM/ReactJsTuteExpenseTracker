import { api } from './api'
import type { Budget, CreateBudgetInput, UpdateBudgetInput } from '@/types'

export const budgetsService = {
  /**
   * Get all budgets
   */
  async getAll(): Promise<Budget[]> {
    return api.get<Budget[]>('/budgets')
  },

  /**
   * Get a single budget by ID
   */
  async getById(id: string): Promise<Budget> {
    return api.get<Budget>(`/budgets/${id}`)
  },

  /**
   * Get budgets for a specific month
   */
  async getByMonth(month: string): Promise<Budget[]> {
    return api.get<Budget[]>('/budgets', { month })
  },

  /**
   * Get budgets for a specific category
   */
  async getByCategoryId(categoryId: string): Promise<Budget[]> {
    return api.get<Budget[]>('/budgets', { categoryId })
  },

  /**
   * Create a new budget
   */
  async create(data: CreateBudgetInput): Promise<Budget> {
    const budget = {
      ...data,
      userId: '1', // In a real app, get this from auth
    }
    return api.post<Budget>('/budgets', budget)
  },

  /**
   * Update an existing budget
   */
  async update({ id, ...data }: UpdateBudgetInput): Promise<Budget> {
    return api.put<Budget>(`/budgets/${id}`, data)
  },

  /**
   * Delete a budget
   */
  async delete(id: string): Promise<void> {
    return api.delete<void>(`/budgets/${id}`)
  },
}
