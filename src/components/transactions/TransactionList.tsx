import { useMemo } from 'react'
import { TransactionItem } from './TransactionItem'
import { SkeletonTransactionItem } from '@/components/ui/Skeleton'
import type { Transaction, Category } from '@/types'
import { cn } from '@/utils/cn'

interface TransactionListProps {
  transactions: Transaction[]
  categories?: Category[]
  isLoading?: boolean
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
  showActions?: boolean
  compact?: boolean
  emptyMessage?: string
  className?: string
}

export function TransactionList({
  transactions,
  categories = [],
  isLoading = false,
  onEdit,
  onDelete,
  showActions = true,
  compact = false,
  emptyMessage = 'No transactions found',
  className,
}: TransactionListProps) {
  // Create a map for quick category lookup
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  )

  if (isLoading) {
    return (
      <div className={cn('divide-y divide-slate-200 dark:divide-slate-700', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonTransactionItem key={i} />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('divide-y divide-slate-200 dark:divide-slate-700', className)}>
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          category={categoryMap.get(transaction.categoryId)}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
          compact={compact}
        />
      ))}
    </div>
  )
}
