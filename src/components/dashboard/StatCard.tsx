import { memo, type ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

interface StatCardProps {
  title: string
  value: string
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'danger'
  className?: string
}

const variantStyles = {
  default: {
    icon: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    trend: {
      positive: 'text-success-600 dark:text-success-400',
      negative: 'text-danger-600 dark:text-danger-400',
    },
  },
  success: {
    icon: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
    trend: {
      positive: 'text-success-600 dark:text-success-400',
      negative: 'text-danger-600 dark:text-danger-400',
    },
  },
  danger: {
    icon: 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400',
    trend: {
      positive: 'text-success-600 dark:text-success-400',
      negative: 'text-danger-600 dark:text-danger-400',
    },
  },
}

export const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={cn('flex items-start justify-between', className)}>
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend.isPositive ? styles.trend.positive : styles.trend.negative
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-slate-500 dark:text-slate-400">vs last month</span>
          </div>
        )}
      </div>
      <div className={cn('rounded-xl p-3', styles.icon)}>{icon}</div>
    </Card>
  )
})
