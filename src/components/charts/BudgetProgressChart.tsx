import { formatCurrency } from '@/utils/format'
import { getBudgetProgressColor } from '@/utils/chartHelpers'
import { cn } from '@/utils/cn'

interface BudgetItem {
  categoryId: string
  categoryName: string
  color: string
  budgeted: number
  spent: number
  remaining: number
  percentage: number
}

interface BudgetProgressChartProps {
  data: BudgetItem[]
  isLoading?: boolean
}

export function BudgetProgressChart({ data, isLoading }: BudgetProgressChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 dark:text-slate-400">
        No budget data available for this month
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const progressColor = getBudgetProgressColor(item.percentage)
        const isOverBudget = item.percentage > 100

        return (
          <div key={item.categoryId} className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.categoryName}
                </span>
              </div>
              <div className="text-sm">
                <span className={cn('font-medium', isOverBudget && 'text-danger-600 dark:text-danger-400')}>
                  {formatCurrency(item.spent)}
                </span>
                <span className="text-slate-400"> / {formatCurrency(item.budgeted)}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(item.percentage, 100)}%`,
                  backgroundColor: progressColor,
                }}
              />
              {/* Overflow indicator */}
              {isOverBudget && (
                <div
                  className="absolute inset-y-0 right-0 animate-pulse rounded-full bg-danger-500"
                  style={{
                    width: `${Math.min(item.percentage - 100, 20)}%`,
                  }}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs">
              <span
                className={cn(
                  isOverBudget
                    ? 'text-danger-600 dark:text-danger-400'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {isOverBudget
                  ? `${formatCurrency(Math.abs(item.remaining))} over budget`
                  : `${formatCurrency(item.remaining)} remaining`}
              </span>
              <span
                className={cn(
                  'font-medium',
                  item.percentage >= 100
                    ? 'text-danger-600 dark:text-danger-400'
                    : item.percentage >= 80
                      ? 'text-warning-600 dark:text-warning-400'
                      : 'text-success-600 dark:text-success-400'
                )}
              >
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
