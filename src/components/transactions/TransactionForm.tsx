import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTransactionSchema, type CreateTransactionForm } from '@/schemas/transaction'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import type { Transaction } from '@/types'
import { formatDateForInput } from '@/utils/format'
import { useEffect } from 'react'

interface TransactionFormProps {
  initialData?: Transaction
  onSubmit: (data: CreateTransactionForm) => void
  onCancel?: () => void
  isSubmitting?: boolean
}

export function TransactionForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TransactionFormProps) {
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTransactionForm>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: initialData
      ? {
          type: initialData.type,
          amount: initialData.amount,
          categoryId: initialData.categoryId,
          description: initialData.description,
          date: formatDateForInput(initialData.date),
        }
      : {
          type: 'expense',
          amount: undefined,
          categoryId: '',
          description: '',
          date: formatDateForInput(new Date().toISOString()),
        },
  })

  const selectedType = watch('type')

  // Filter categories based on selected type
  const filteredCategories = categories?.filter((c) => c.type === selectedType) || []

  // Reset category when type changes
  useEffect(() => {
    if (!initialData) {
      setValue('categoryId', '')
    }
  }, [selectedType, setValue, initialData])

  const typeOptions = [
    { value: 'expense', label: 'Expense' },
    { value: 'income', label: 'Income' },
  ]

  const categoryOptions = filteredCategories.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const handleFormSubmit = (data: CreateTransactionForm) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Type */}
      <FormField label="Type" htmlFor="type" error={errors.type?.message} required>
        <div className="flex gap-2">
          {typeOptions.map((option) => (
            <label
              key={option.value}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                selectedType === option.value
                  ? option.value === 'expense'
                    ? 'border-danger-500 bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400'
                    : 'border-success-500 bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <input
                type="radio"
                value={option.value}
                {...register('type')}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </FormField>

      {/* Amount */}
      <FormField label="Amount" htmlFor="amount" error={errors.amount?.message} required>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
      </FormField>

      {/* Category */}
      <FormField label="Category" htmlFor="categoryId" error={errors.categoryId?.message} required>
        <Select
          id="categoryId"
          options={categoryOptions}
          placeholder={categoriesLoading ? 'Loading categories...' : 'Select a category'}
          error={errors.categoryId?.message}
          disabled={categoriesLoading}
          {...register('categoryId')}
        />
      </FormField>

      {/* Description */}
      <FormField
        label="Description"
        htmlFor="description"
        error={errors.description?.message}
        required
      >
        <Input
          id="description"
          placeholder="Enter a description"
          error={errors.description?.message}
          {...register('description')}
        />
      </FormField>

      {/* Date */}
      <FormField label="Date" htmlFor="date" error={errors.date?.message} required>
        <DatePicker
          id="date"
          error={errors.date?.message}
          {...register('date')}
        />
      </FormField>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? 'Update' : 'Create'} Transaction
        </Button>
      </div>
    </form>
  )
}
