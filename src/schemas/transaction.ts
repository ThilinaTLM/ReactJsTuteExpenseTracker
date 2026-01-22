import { z } from 'zod'
import { VALIDATION } from '@/utils/constants'

/**
 * Schema for transaction type
 */
export const transactionTypeSchema = z.enum(['income', 'expense'], {
  errorMap: () => ({ message: 'Please select a transaction type' }),
})

/**
 * Schema for creating a new transaction
 */
export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .min(VALIDATION.MIN_AMOUNT, `Amount must be at least $${VALIDATION.MIN_AMOUNT}`)
    .max(VALIDATION.MAX_AMOUNT, `Amount cannot exceed $${VALIDATION.MAX_AMOUNT.toLocaleString()}`),
  categoryId: z.string({
    required_error: 'Please select a category',
  }).min(1, 'Please select a category'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(
      VALIDATION.MAX_DESCRIPTION_LENGTH,
      `Description cannot exceed ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters`
    ),
  date: z.string({
    required_error: 'Date is required',
  }).min(1, 'Date is required'),
})

/**
 * Schema for updating an existing transaction
 */
export const updateTransactionSchema = createTransactionSchema.partial().extend({
  id: z.string(),
})

/**
 * Type inference from schemas
 */
export type CreateTransactionForm = z.infer<typeof createTransactionSchema>
export type UpdateTransactionForm = z.infer<typeof updateTransactionSchema>

/**
 * Schema for transaction filters
 */
export const transactionFiltersSchema = z.object({
  type: transactionTypeSchema.optional(),
  categoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
})

export type TransactionFiltersForm = z.infer<typeof transactionFiltersSchema>
