import { memo } from 'react'
import { ArrowUpRight, ArrowDownRight, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { Transaction, Category } from '@/types'
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils/format'
import { cn } from '@/utils/cn'
import { useState, useRef, useEffect } from 'react'

interface TransactionItemProps {
  transaction: Transaction
  category?: Category
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
  showActions?: boolean
  compact?: boolean
}

export const TransactionItem = memo(function TransactionItem({
  transaction,
  category,
  onEdit,
  onDelete,
  showActions = true,
  compact = false,
}: TransactionItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isIncome = transaction.type === 'income'

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50',
        compact ? 'py-2' : 'p-3'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
            isIncome
              ? 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400'
              : 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400'
          )}
          style={category ? { backgroundColor: `${category.color}20`, color: category.color } : undefined}
        >
          {isIncome ? (
            <ArrowUpRight className="h-5 w-5" />
          ) : (
            <ArrowDownRight className="h-5 w-5" />
          )}
        </div>

        {/* Details */}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
            {transaction.description}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {category?.name || 'Uncategorized'} • {compact ? formatRelativeTime(transaction.date) : formatDate(transaction.date)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Amount */}
        <p
          className={cn(
            'text-sm font-semibold',
            isIncome
              ? 'text-success-600 dark:text-success-400'
              : 'text-danger-600 dark:text-danger-400'
          )}
        >
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>

        {/* Actions menu */}
        {showActions && (onEdit || onDelete) && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(transaction)
                      setShowMenu(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(transaction)
                      setShowMenu(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
})
