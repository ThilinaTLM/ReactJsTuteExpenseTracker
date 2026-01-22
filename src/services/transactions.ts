import { api } from './api'
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  PaginationParams,
} from '@/types'

interface GetTransactionsParams extends Partial<TransactionFilters>, Partial<PaginationParams> {}

interface GetTransactionsResponse {
  data: Transaction[]
  total: number
}

export const transactionsService = {
  /**
   * Get all transactions with optional filtering and pagination
   */
  async getAll(params?: GetTransactionsParams): Promise<GetTransactionsResponse> {
    const queryParams: Record<string, string | number | undefined> = {}

    if (params?.page) queryParams._page = params.page
    if (params?.limit) queryParams._limit = params.limit
    if (params?.type) queryParams.type = params.type
    if (params?.categoryId) queryParams.categoryId = params.categoryId
    if (params?.search) queryParams.q = params.search

    // For date filtering, json-server supports _gte and _lte
    if (params?.startDate) queryParams['date_gte'] = params.startDate
    if (params?.endDate) queryParams['date_lte'] = params.endDate

    // Sort by date descending by default
    queryParams._sort = 'date'
    queryParams._order = 'desc'

    const transactions = await api.get<Transaction[]>('/transactions', queryParams)

    // json-server returns total in x-total-count header, but we'll estimate for now
    // In a real app, you'd handle pagination properly
    return {
      data: transactions,
      total: transactions.length,
    }
  },

  /**
   * Get a single transaction by ID
   */
  async getById(id: string): Promise<Transaction> {
    return api.get<Transaction>(`/transactions/${id}`)
  },

  /**
   * Create a new transaction
   */
  async create(data: CreateTransactionInput): Promise<Transaction> {
    const transaction = {
      ...data,
      userId: '1', // In a real app, get this from auth
      createdAt: new Date().toISOString(),
    }
    return api.post<Transaction>('/transactions', transaction)
  },

  /**
   * Update an existing transaction
   */
  async update({ id, ...data }: UpdateTransactionInput): Promise<Transaction> {
    return api.put<Transaction>(`/transactions/${id}`, data)
  },

  /**
   * Delete a transaction
   */
  async delete(id: string): Promise<void> {
    return api.delete<void>(`/transactions/${id}`)
  },

  /**
   * Get transactions for dashboard summary (current month)
   */
  async getCurrentMonthTransactions(): Promise<Transaction[]> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const result = await this.getAll({
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
    })

    return result.data
  },

  /**
   * Get recent transactions (last 5)
   */
  async getRecent(limit: number = 5): Promise<Transaction[]> {
    const result = await this.getAll({ limit })
    return result.data
  },
}
