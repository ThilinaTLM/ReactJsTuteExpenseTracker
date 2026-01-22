// User types
export interface User {
  id: string
  email: string
  name: string
  avatar: string | null
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Transaction types
export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  categoryId: string
  description: string
  date: string
  createdAt: string
}

export interface CreateTransactionInput {
  type: TransactionType
  amount: number
  categoryId: string
  description: string
  date: string
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string
}

// Category types
export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: TransactionType
}

// Budget types
export interface Budget {
  id: string
  userId: string
  categoryId: string
  amount: number
  month: string // Format: "YYYY-MM"
}

export interface CreateBudgetInput {
  categoryId: string
  amount: number
  month: string
}

export interface UpdateBudgetInput extends Partial<CreateBudgetInput> {
  id: string
}

// Filter types
export interface TransactionFilters {
  type?: TransactionType
  categoryId?: string
  startDate?: string
  endDate?: string
  search?: string
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API Error types
export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

// Dashboard summary types
export interface DashboardSummary {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  transactionCount: number
}

export interface CategorySpending {
  categoryId: string
  categoryName: string
  color: string
  amount: number
  percentage: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expenses: number
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// UI State types
export interface ModalState {
  isOpen: boolean
  type: 'create' | 'edit' | 'delete' | null
  data?: unknown
}

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}
