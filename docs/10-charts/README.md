# Module 10: Charts & Data Visualization

## Overview

In this module, we'll learn how to create interactive charts and data visualizations using Recharts. We'll build spending breakdowns, monthly trends, and budget progress indicators.

## Learning Objectives

- Understand Recharts components and structure
- Create pie charts for category breakdowns
- Build bar charts for monthly trends
- Implement progress bars for budgets
- Make charts responsive and interactive

## Prerequisites

- Module 09 completed (Zustand)
- Understanding of data transformation

---

## 1. Introduction to Recharts

### Why Recharts?

- **Declarative**: React component syntax
- **Composable**: Build complex charts from simple parts
- **Responsive**: Built-in responsiveness
- **Customizable**: Extensive styling options
- **Interactive**: Tooltips, legends, animations

### Installation

```bash
npm install recharts
```

### Basic Structure

```tsx
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
]

const BasicChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

---

## 2. Spending Pie Chart

### Preparing Data

```tsx
// src/hooks/useSpendingByCategory.ts
import { useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { useCategories } from './useCategories'

export const useSpendingByCategory = () => {
  const { data: transactions } = useTransactions()
  const { data: categories } = useCategories()

  return useMemo(() => {
    if (!transactions || !categories) return []

    // Get expense transactions only
    const expenses = transactions.filter((t) => t.type === 'expense')

    // Group by category
    const byCategory = expenses.reduce((acc, t) => {
      const categoryId = t.categoryId
      if (!acc[categoryId]) {
        acc[categoryId] = 0
      }
      acc[categoryId] += t.amount
      return acc
    }, {} as Record<string, number>)

    // Map to chart data format
    return Object.entries(byCategory)
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId)
        return {
          name: category?.name ?? 'Unknown',
          value: amount,
          color: category?.color ?? '#94a3b8',
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [transactions, categories])
}
```

### Pie Chart Component

```tsx
// src/components/charts/SpendingPieChart.tsx
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { useSpendingByCategory } from '@/hooks/useSpendingByCategory'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/utils/format'

export const SpendingPieChart = () => {
  const data = useSpendingByCategory()

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-500">
            No expense data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-slate-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

### Custom Tooltip

```tsx
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { color: string } }>
}) => {
  if (!active || !payload?.length) return null

  const data = payload[0]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.payload.color }}
        />
        <span className="font-medium">{data.name}</span>
      </div>
      <p className="mt-1 text-lg font-semibold">
        {formatCurrency(data.value)}
      </p>
    </div>
  )
}

// Usage
<Tooltip content={<CustomTooltip />} />
```

---

## 3. Monthly Trend Chart

### Preparing Monthly Data

```tsx
// src/hooks/useMonthlyTrends.ts
import { useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

export const useMonthlyTrends = (months: number = 6) => {
  const { data: transactions } = useTransactions()

  return useMemo(() => {
    if (!transactions) return []

    const now = new Date()
    const monthsData = []

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i)
      const start = startOfMonth(date)
      const end = endOfMonth(date)

      const monthTransactions = transactions.filter((t) =>
        isWithinInterval(new Date(t.date), { start, end })
      )

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      const expenses = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      monthsData.push({
        month: format(date, 'MMM'),
        income,
        expenses,
        balance: income - expenses,
      })
    }

    return monthsData
  }, [transactions, months])
}
```

### Bar Chart Component

```tsx
// src/components/charts/MonthlyTrendChart.tsx
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useMonthlyTrends } from '@/hooks/useMonthlyTrends'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/format'

export const MonthlyTrendChart = () => {
  const data = useMonthlyTrends(6)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar
              dataKey="income"
              name="Income"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

---

## 4. Budget Progress Chart

### Preparing Budget Data

```tsx
// src/hooks/useBudgetProgress.ts
import { useMemo } from 'react'
import { useBudgets } from './useBudgets'
import { useTransactions } from './useTransactions'
import { useCategories } from './useCategories'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

export const useBudgetProgress = () => {
  const { data: budgets } = useBudgets()
  const { data: transactions } = useTransactions()
  const { data: categories } = useCategories()

  return useMemo(() => {
    if (!budgets || !transactions || !categories) return []

    const now = new Date()
    const currentMonth = format(now, 'yyyy-MM')
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Filter current month budgets
    const currentBudgets = budgets.filter((b) => b.month === currentMonth)

    return currentBudgets.map((budget) => {
      const category = categories.find((c) => c.id === budget.categoryId)

      // Calculate spent amount for this category this month
      const spent = transactions
        .filter(
          (t) =>
            t.categoryId === budget.categoryId &&
            t.type === 'expense' &&
            isWithinInterval(new Date(t.date), {
              start: monthStart,
              end: monthEnd,
            })
        )
        .reduce((sum, t) => sum + t.amount, 0)

      const percentage = Math.min((spent / budget.amount) * 100, 100)
      const remaining = Math.max(budget.amount - spent, 0)

      return {
        id: budget.id,
        category: category?.name ?? 'Unknown',
        color: category?.color ?? '#94a3b8',
        budgeted: budget.amount,
        spent,
        remaining,
        percentage,
        isOverBudget: spent > budget.amount,
      }
    })
  }, [budgets, transactions, categories])
}
```

### Progress Bar Component

```tsx
// src/components/charts/BudgetProgressChart.tsx
import { useBudgetProgress } from '@/hooks/useBudgetProgress'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/format'
import { cn } from '@/utils/cn'

export const BudgetProgressChart = () => {
  const budgets = useBudgetProgress()

  if (!budgets.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-slate-500">
            No budgets set for this month
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((budget) => (
          <BudgetProgressItem key={budget.id} budget={budget} />
        ))}
      </CardContent>
    </Card>
  )
}

interface BudgetProgressItemProps {
  budget: {
    category: string
    color: string
    budgeted: number
    spent: number
    remaining: number
    percentage: number
    isOverBudget: boolean
  }
}

const BudgetProgressItem = ({ budget }: BudgetProgressItemProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: budget.color }}
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {budget.category}
          </span>
        </div>
        <span className={cn(
          'text-sm font-medium',
          budget.isOverBudget
            ? 'text-danger-600'
            : 'text-slate-600 dark:text-slate-400'
        )}>
          {formatCurrency(budget.spent)} / {formatCurrency(budget.budgeted)}
        </span>
      </div>

      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            budget.isOverBudget ? 'bg-danger-500' : 'bg-primary-500'
          )}
          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-500">
          {budget.percentage.toFixed(0)}% used
        </span>
        <span className={cn(
          'text-xs',
          budget.isOverBudget ? 'text-danger-600' : 'text-success-600'
        )}>
          {budget.isOverBudget
            ? `${formatCurrency(budget.spent - budget.budgeted)} over`
            : `${formatCurrency(budget.remaining)} left`}
        </span>
      </div>
    </div>
  )
}
```

---

## 5. Area Chart for Balance Trend

```tsx
// src/components/charts/BalanceTrendChart.tsx
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useMonthlyTrends } from '@/hooks/useMonthlyTrends'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/format'

export const BalanceTrendChart = () => {
  const data = useMonthlyTrends(12)

  // Calculate cumulative balance
  let runningBalance = 0
  const chartData = data.map((month) => {
    runningBalance += month.balance
    return {
      ...month,
      cumulativeBalance: runningBalance,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey="cumulativeBalance"
              name="Balance"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorBalance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

---

## 6. Stat Cards

```tsx
// src/components/dashboard/StatCard.tsx
import { type ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/format'
import { cn } from '@/utils/cn'

interface StatCardProps {
  title: string
  value: number
  change?: number
  icon: ReactNode
  type?: 'balance' | 'income' | 'expense'
}

export const StatCard = ({
  title,
  value,
  change,
  icon,
  type = 'balance',
}: StatCardProps) => {
  const colorClasses = {
    balance: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    income: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
    expense: 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400',
  }

  const valueClasses = {
    balance: 'text-slate-900 dark:text-white',
    income: 'text-success-600 dark:text-success-400',
    expense: 'text-danger-600 dark:text-danger-400',
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <p className={cn('text-2xl font-bold mt-1', valueClasses[type])}>
              {type === 'expense' ? '-' : ''}{formatCurrency(Math.abs(value))}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-danger-500" />
                )}
                <span className={cn(
                  'text-sm font-medium',
                  change >= 0 ? 'text-success-600' : 'text-danger-600'
                )}>
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
                <span className="text-sm text-slate-500">vs last month</span>
              </div>
            )}
          </div>
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            colorClasses[type]
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 7. Dashboard Layout

```tsx
// src/pages/Dashboard.tsx
import { useMemo } from 'react'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { StatCard } from '@/components/dashboard/StatCard'
import { SpendingPieChart } from '@/components/charts/SpendingPieChart'
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart'
import { BudgetProgressChart } from '@/components/charts/BudgetProgressChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { Skeleton } from '@/components/ui/Skeleton'

export const Dashboard = () => {
  const { data: transactions, isLoading } = useTransactions()

  const stats = useMemo(() => {
    if (!transactions) return null

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      balance: income - expenses,
      income,
      expenses,
    }
  }, [transactions])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Balance"
          value={stats?.balance ?? 0}
          icon={<DollarSign className="h-6 w-6" />}
          type="balance"
        />
        <StatCard
          title="Total Income"
          value={stats?.income ?? 0}
          icon={<TrendingUp className="h-6 w-6" />}
          type="income"
        />
        <StatCard
          title="Total Expenses"
          value={stats?.expenses ?? 0}
          icon={<TrendingDown className="h-6 w-6" />}
          type="expense"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTrendChart />
        <SpendingPieChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetProgressChart />
        <RecentTransactions />
      </div>
    </div>
  )
}

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
    </div>
  </div>
)
```

---

## 8. Chart Responsiveness

### Mobile-Friendly Charts

```tsx
const ResponsivePieChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          // Smaller on mobile
          innerRadius="40%"
          outerRadius="70%"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        {/* Hide legend on mobile */}
        <Legend
          verticalAlign="bottom"
          wrapperStyle={{
            display: window.innerWidth < 768 ? 'none' : 'block',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

### Using Media Queries

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery'

const Chart = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
      <BarChart data={data}>
        <XAxis
          dataKey="month"
          tick={{ fontSize: isMobile ? 10 : 12 }}
        />
        {/* ... */}
      </BarChart>
    </ResponsiveContainer>
  )
}
```

---

## Exercises

### Exercise 1: Daily Spending Chart

Create a line chart showing daily spending for the current month.

### Exercise 2: Category Comparison

Create a grouped bar chart comparing spending across categories between two months.

### Exercise 3: Interactive Budget Editor

Add click handlers to the budget progress bars to open an edit modal.

---

## Checkpoint

At this point, you should have:
- ✅ Pie chart for spending by category
- ✅ Bar chart for monthly trends
- ✅ Progress bars for budget tracking
- ✅ Stat cards for key metrics
- ✅ Complete dashboard layout

---

## Summary

In this module, we learned:
- Recharts provides composable, declarative chart components
- ResponsiveContainer makes charts adapt to their container
- Custom tooltips improve data presentation
- Progress bars visualize budget tracking
- Charts should be responsive for mobile devices

## Next Steps

In the next module, we'll implement authentication with login, registration, and protected routes.

[← Back to Module 09](../09-zustand/README.md) | [Continue to Module 11: Authentication →](../11-auth/README.md)
