import { useCallback } from 'react'
import { Filter, X } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/Button'
import { useFilterStore } from '@/stores/useFilterStore'
import { useCategories } from '@/hooks/useCategories'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/utils/cn'
import { useState } from 'react'

interface TransactionFiltersProps {
  className?: string
  compact?: boolean
}

export function TransactionFilters({ className, compact = false }: TransactionFiltersProps) {
  const { filters, setFilters, resetFilters, setSearch } = useFilterStore()
  const { data: categories } = useCategories()
  const [localSearch, setLocalSearch] = useState(filters.search || '')
  const [showFilters, setShowFilters] = useState(false)

  // Debounce search input
  const debouncedSearch = useDebounce(localSearch, 300)

  // Update filter store when debounced value changes
  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value)
      // Immediately update if clearing, otherwise wait for debounce
      if (!value) {
        setSearch('')
      }
    },
    [setSearch]
  )

  // Update store when debounced search changes
  // We use the useDebounce hook to delay the actual filter update
  if (debouncedSearch !== filters.search && debouncedSearch) {
    setSearch(debouncedSearch)
  }

  const hasActiveFilters =
    filters.type ||
    filters.categoryId ||
    filters.startDate ||
    filters.endDate ||
    filters.search

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
  ]

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...(categories?.map((c) => ({ value: c.id, label: c.name })) || []),
  ]

  if (compact) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search transactions..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            onClear={() => handleSearchChange('')}
            className="flex-1"
          />
          <Button
            variant={showFilters ? 'secondary' : 'ghost'}
            size="md"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(hasActiveFilters && 'text-primary-600')}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="animate-slide-down space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                options={typeOptions}
                value={filters.type || ''}
                onChange={(e) => setFilters({ type: e.target.value as 'income' | 'expense' | undefined || undefined })}
              />
              <Select
                options={categoryOptions}
                value={filters.categoryId || ''}
                onChange={(e) => setFilters({ categoryId: e.target.value || undefined })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DatePicker
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ startDate: e.target.value || undefined })}
                placeholder="Start date"
              />
              <DatePicker
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ endDate: e.target.value || undefined })}
                placeholder="End date"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full">
                <X className="mr-1 h-4 w-4" />
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <SearchInput
        placeholder="Search transactions..."
        value={localSearch}
        onChange={(e) => handleSearchChange(e.target.value)}
        onClear={() => handleSearchChange('')}
        className="w-full sm:w-64"
      />
      <Select
        options={typeOptions}
        value={filters.type || ''}
        onChange={(e) => setFilters({ type: e.target.value as 'income' | 'expense' | undefined || undefined })}
        className="w-full sm:w-40"
      />
      <Select
        options={categoryOptions}
        value={filters.categoryId || ''}
        onChange={(e) => setFilters({ categoryId: e.target.value || undefined })}
        className="w-full sm:w-48"
      />
      <DatePicker
        value={filters.startDate || ''}
        onChange={(e) => setFilters({ startDate: e.target.value || undefined })}
        className="w-full sm:w-40"
      />
      <DatePicker
        value={filters.endDate || ''}
        onChange={(e) => setFilters({ endDate: e.target.value || undefined })}
        className="w-full sm:w-40"
      />
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
