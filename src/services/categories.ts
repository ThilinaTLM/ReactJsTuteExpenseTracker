import { api } from './api'
import type { Category, TransactionType } from '@/types'

export const categoriesService = {
  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    return api.get<Category[]>('/categories')
  },

  /**
   * Get a single category by ID
   */
  async getById(id: string): Promise<Category> {
    return api.get<Category>(`/categories/${id}`)
  },

  /**
   * Get categories by type (income or expense)
   */
  async getByType(type: TransactionType): Promise<Category[]> {
    return api.get<Category[]>('/categories', { type })
  },

  /**
   * Create a new category
   */
  async create(data: Omit<Category, 'id'>): Promise<Category> {
    return api.post<Category>('/categories', data)
  },

  /**
   * Update an existing category
   */
  async update(id: string, data: Partial<Omit<Category, 'id'>>): Promise<Category> {
    return api.put<Category>(`/categories/${id}`, data)
  },

  /**
   * Delete a category
   */
  async delete(id: string): Promise<void> {
    return api.delete<void>(`/categories/${id}`)
  },
}
