import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { MonthlyTrend } from '@/types'
import { formatCurrency } from '@/utils/format'
import { CHART_COLORS } from '@/utils/constants'
import { SkeletonChart } from '@/components/ui/Skeleton'
import { useThemeStore } from '@/stores/useThemeStore'

interface MonthlyTrendChartProps {
  data: MonthlyTrend[]
  isLoading?: boolean
}

export function MonthlyTrendChart({ data, isLoading }: MonthlyTrendChartProps) {
  const { resolvedTheme } = useThemeStore()
  const isDark = resolvedTheme === 'dark'

  if (isLoading) {
    return <SkeletonChart />
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 dark:text-slate-400">
        No trend data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDark ? CHART_COLORS.gridDark : CHART_COLORS.grid}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
          axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
        />
        <YAxis
          tickFormatter={(value) => `$${value / 1000}k`}
          tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
          axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatCurrency(value),
            name.charAt(0).toUpperCase() + name.slice(1),
          ]}
          contentStyle={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderRadius: '8px',
          }}
          labelStyle={{
            color: isDark ? '#f8fafc' : '#0f172a',
          }}
        />
        <Legend
          formatter={(value: string) => (
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </span>
          )}
        />
        <Bar dataKey="income" fill={CHART_COLORS.income} radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill={CHART_COLORS.expense} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
