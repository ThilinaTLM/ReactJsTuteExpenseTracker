import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { BudgetProgressChart } from '@/components/charts/BudgetProgressChart'
import { useBudgets } from '@/hooks/useBudgets'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { formatMonth, getMonthString, formatCurrency } from '@/utils/format'
import { calculateBudgetProgress } from '@/utils/chartHelpers'

export function Budgets() {
  const currentMonth = getMonthString()

  const { data: budgets, isLoading: budgetsLoading } = useBudgets()
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions()
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  // Memoize transactions to avoid triggering dependent useMemo hooks on every render
  const transactions = useMemo(() => transactionsData?.data || [], [transactionsData?.data])

  // Filter budgets for current month
  const currentMonthBudgets = useMemo(
    () => budgets?.filter((b) => b.month === currentMonth) || [],
    [budgets, currentMonth]
  )

  // Calculate budget progress
  const budgetProgress = useMemo(
    () =>
      categories
        ? calculateBudgetProgress(transactions, currentMonthBudgets, categories, currentMonth)
        : [],
    [transactions, currentMonthBudgets, categories, currentMonth]
  )

  // Calculate totals
  const totals = useMemo(() => {
    const totalBudgeted = currentMonthBudgets.reduce((sum, b) => sum + b.amount, 0)
    const totalSpent = budgetProgress.reduce((sum, p) => sum + p.spent, 0)
    const totalRemaining = totalBudgeted - totalSpent
    const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0

    return {
      totalBudgeted,
      totalSpent,
      totalRemaining,
      overallPercentage,
    }
  }, [currentMonthBudgets, budgetProgress])

  const isLoading = budgetsLoading || transactionsLoading || categoriesLoading

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Budgets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track your spending goals for {formatMonth(currentMonth)}
          </p>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Budgeted</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totals.totalBudgeted)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Spent</p>
            <p className="mt-1 text-2xl font-bold text-danger-600 dark:text-danger-400">
              {formatCurrency(totals.totalSpent)}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {totals.overallPercentage.toFixed(0)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Remaining</p>
            <p
              className={`mt-1 text-2xl font-bold ${
                totals.totalRemaining >= 0
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-danger-600 dark:text-danger-400'
              }`}
            >
              {formatCurrency(Math.abs(totals.totalRemaining))}
              {totals.totalRemaining < 0 && ' over'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Category Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetProgressChart data={budgetProgress} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Budget Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              <span className="font-medium text-slate-900 dark:text-white">50/30/20 Rule:</span>{' '}
              Allocate 50% of income to needs, 30% to wants, and 20% to savings.
            </p>
            <p>
              <span className="font-medium text-slate-900 dark:text-white">Track Daily:</span>{' '}
              Regular monitoring helps catch overspending early.
            </p>
            <p>
              <span className="font-medium text-slate-900 dark:text-white">Review Monthly:</span>{' '}
              Adjust budgets based on actual spending patterns.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
