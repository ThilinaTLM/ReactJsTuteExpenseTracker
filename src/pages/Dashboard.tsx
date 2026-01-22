import { useMemo } from 'react'
import { Wallet, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/dashboard/StatCard'
import { TransactionList } from '@/components/transactions/TransactionList'
import { SpendingPieChart } from '@/components/charts/SpendingPieChart'
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart'
import { BudgetProgressChart } from '@/components/charts/BudgetProgressChart'
import { useTransactions, useRecentTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useBudgetsByMonth } from '@/hooks/useBudgets'
import { formatCurrency, getMonthString, formatMonth } from '@/utils/format'
import {
  calculateSpendingByCategory,
  calculateMonthlyTrend,
  calculateBudgetProgress,
} from '@/utils/chartHelpers'

export function Dashboard() {
  const currentMonth = getMonthString()

  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions()
  const { data: recentTransactions, isLoading: recentLoading } = useRecentTransactions(5)
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: budgets, isLoading: budgetsLoading } = useBudgetsByMonth(currentMonth)

  const transactions = transactionsData?.data || []

  // Calculate dashboard stats
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalBalance = totalIncome - totalExpenses

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      transactionCount: transactions.length,
    }
  }, [transactions])

  // Calculate chart data
  const spendingByCategory = useMemo(
    () => (categories ? calculateSpendingByCategory(transactions, categories) : []),
    [transactions, categories]
  )

  const monthlyTrend = useMemo(
    () => calculateMonthlyTrend(transactions, 6),
    [transactions]
  )

  const budgetProgress = useMemo(
    () =>
      budgets && categories
        ? calculateBudgetProgress(transactions, budgets, categories, currentMonth)
        : [],
    [transactions, budgets, categories, currentMonth]
  )

  const isLoading = transactionsLoading || categoriesLoading

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Overview of your finances for {formatMonth(currentMonth)}
          </p>
        </div>
        <Link to="/transactions">
          <Button>
            Add Transaction
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(stats.totalBalance)}
          icon={<Wallet className="h-6 w-6" />}
          variant={stats.totalBalance >= 0 ? 'default' : 'danger'}
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(stats.totalIncome)}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(stats.totalExpenses)}
          icon={<TrendingDown className="h-6 w-6" />}
          variant="danger"
        />
        <StatCard
          title="Transactions"
          value={stats.transactionCount.toString()}
          icon={<ArrowRight className="h-6 w-6" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart data={monthlyTrend} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Spending by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingPieChart data={spendingByCategory} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link to="/transactions">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <TransactionList
              transactions={recentTransactions || []}
              categories={categories || []}
              isLoading={recentLoading || categoriesLoading}
              showActions={false}
              compact
              emptyMessage="No recent transactions"
            />
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Budget Progress</CardTitle>
            <Link to="/budgets">
              <Button variant="ghost" size="sm">
                Manage
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <BudgetProgressChart data={budgetProgress} isLoading={budgetsLoading || isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
