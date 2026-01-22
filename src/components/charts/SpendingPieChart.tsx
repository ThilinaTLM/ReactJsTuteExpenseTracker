import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { CategorySpending } from '@/types'
import { formatCurrency } from '@/utils/format'
import { SkeletonChart } from '@/components/ui/Skeleton'

interface SpendingPieChartProps {
  data: CategorySpending[]
  isLoading?: boolean
}

export function SpendingPieChart({ data, isLoading }: SpendingPieChartProps) {
  if (isLoading) {
    return <SkeletonChart />
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 dark:text-slate-400">
        No expense data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="amount"
          nameKey="categoryName"
          label={({ categoryName, percentage }) =>
            percentage > 5 ? `${categoryName} (${percentage.toFixed(0)}%)` : ''
          }
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Amount']}
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
            borderRadius: '8px',
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value: string) => (
            <span className="text-sm text-slate-600 dark:text-slate-400">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
