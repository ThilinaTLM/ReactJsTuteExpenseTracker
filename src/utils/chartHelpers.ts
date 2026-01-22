import type { Transaction, Category, CategorySpending, MonthlyTrend } from '@/types'
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'

/**
 * Calculate spending by category from transactions
 */
export function calculateSpendingByCategory(
  transactions: Transaction[],
  categories: Category[]
): CategorySpending[] {
  // Only consider expenses
  const expenses = transactions.filter((t) => t.type === 'expense')

  // Group by category
  const categoryTotals = expenses.reduce<Record<string, number>>((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount
    return acc
  }, {})

  // Calculate total
  const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)

  // Create category map
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  // Build spending array
  const spending: CategorySpending[] = Object.entries(categoryTotals)
    .map(([categoryId, amount]) => {
      const category = categoryMap.get(categoryId)
      return {
        categoryId,
        categoryName: category?.name || 'Unknown',
        color: category?.color || '#64748b',
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }
    })
    .sort((a, b) => b.amount - a.amount)

  return spending
}

/**
 * Calculate monthly income vs expenses trend
 */
export function calculateMonthlyTrend(
  transactions: Transaction[],
  months: number = 6
): MonthlyTrend[] {
  const now = new Date()
  const startDate = startOfMonth(subMonths(now, months - 1))
  const endDate = endOfMonth(now)

  // Get all months in range
  const monthsInRange = eachMonthOfInterval({ start: startDate, end: endDate })

  // Initialize trend data
  const trendMap = new Map<string, { income: number; expenses: number }>()
  monthsInRange.forEach((date) => {
    const key = format(date, 'yyyy-MM')
    trendMap.set(key, { income: 0, expenses: 0 })
  })

  // Aggregate transactions
  transactions.forEach((t) => {
    const date = parseISO(t.date)
    const key = format(date, 'yyyy-MM')

    if (trendMap.has(key)) {
      const current = trendMap.get(key)!
      if (t.type === 'income') {
        current.income += t.amount
      } else {
        current.expenses += t.amount
      }
    }
  })

  // Convert to array
  return Array.from(trendMap.entries()).map(([month, data]) => ({
    month: format(parseISO(`${month}-01`), 'MMM'),
    income: Math.round(data.income * 100) / 100,
    expenses: Math.round(data.expenses * 100) / 100,
  }))
}

/**
 * Calculate budget progress for each category
 */
export function calculateBudgetProgress(
  transactions: Transaction[],
  budgets: { categoryId: string; amount: number }[],
  categories: Category[],
  month?: string
): Array<{
  categoryId: string
  categoryName: string
  color: string
  budgeted: number
  spent: number
  remaining: number
  percentage: number
}> {
  // Get current month if not specified
  const targetMonth = month || format(new Date(), 'yyyy-MM')

  // Filter transactions for the target month
  const monthTransactions = transactions.filter((t) => {
    const transactionMonth = format(parseISO(t.date), 'yyyy-MM')
    return transactionMonth === targetMonth && t.type === 'expense'
  })

  // Calculate spending by category
  const spendingByCategory = monthTransactions.reduce<Record<string, number>>((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount
    return acc
  }, {})

  // Create category map
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  // Build progress array
  return budgets.map((budget) => {
    const category = categoryMap.get(budget.categoryId)
    const spent = spendingByCategory[budget.categoryId] || 0
    const remaining = budget.amount - spent
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

    return {
      categoryId: budget.categoryId,
      categoryName: category?.name || 'Unknown',
      color: category?.color || '#64748b',
      budgeted: budget.amount,
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      percentage: Math.round(percentage * 10) / 10,
    }
  })
}

/**
 * Format currency for chart labels
 */
export function formatChartCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`
  }
  return `$${value}`
}

/**
 * Get color for budget progress
 */
export function getBudgetProgressColor(percentage: number): string {
  if (percentage >= 100) return '#ef4444' // danger
  if (percentage >= 80) return '#f59e0b' // warning
  return '#22c55e' // success
}
