# Module 06: Forms & Validation

## Overview

In this module, we'll learn how to handle forms efficiently using React Hook Form and implement robust validation with Zod. We'll build the transaction form for our finance tracker application.

## Learning Objectives

- Understand controlled vs uncontrolled inputs
- Use React Hook Form for form management
- Implement validation with Zod schemas
- Handle form submission and errors
- Create reusable form components

## Prerequisites

- Module 05 completed (React Router)
- Understanding of TypeScript types

---

## 1. Form Handling Basics

### Controlled Inputs

In controlled inputs, React manages the input state:

```tsx
const ControlledInput = () => {
  const [value, setValue] = useState('')

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}
```

### Uncontrolled Inputs

Uncontrolled inputs manage their own state via the DOM:

```tsx
const UncontrolledInput = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    console.log(inputRef.current?.value)
  }

  return <input ref={inputRef} defaultValue="" />
}
```

### Why React Hook Form?

React Hook Form provides the best of both worlds:
- Performance of uncontrolled inputs
- Validation and state management
- Minimal re-renders
- Easy integration with UI libraries

---

## 2. Setting Up React Hook Form

### Installation

```bash
npm install react-hook-form @hookform/resolvers zod
```

### Basic Usage

```tsx
import { useForm } from 'react-hook-form'

interface FormData {
  email: string
  password: string
}

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    console.log(data)
    // { email: "user@example.com", password: "secret" }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### The register Function

`register` connects inputs to the form:

```tsx
// Basic registration
<input {...register('fieldName')} />

// Expands to:
<input
  name="fieldName"
  onChange={...}
  onBlur={...}
  ref={...}
/>

// With validation rules
<input {...register('email', {
  required: 'Email is required',
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Invalid email address',
  },
})} />
```

---

## 3. Zod Schema Validation

### Why Zod?

Zod provides:
- TypeScript-first schema validation
- Automatic type inference
- Composable schemas
- Custom error messages

### Basic Schemas

```tsx
import { z } from 'zod'

// String validations
const emailSchema = z.string().email('Invalid email')
const passwordSchema = z.string().min(8, 'At least 8 characters')

// Number validations
const amountSchema = z.number().positive('Must be positive')
const ageSchema = z.number().int().min(0).max(120)

// Enum
const typeSchema = z.enum(['income', 'expense'])

// Object schema
const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().optional(),
})

// Infer TypeScript type from schema
type User = z.infer<typeof userSchema>
// { name: string; email: string; age?: number }
```

### Transaction Schema

```tsx
// src/schemas/transaction.ts
import { z } from 'zod'

export const transactionSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(100, 'Description too long'),

  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be positive'),

  type: z.enum(['income', 'expense'], {
    required_error: 'Please select a type',
  }),

  categoryId: z
    .string()
    .min(1, 'Please select a category'),

  date: z
    .string()
    .min(1, 'Date is required'),

  notes: z
    .string()
    .max(500, 'Notes too long')
    .optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>
```

---

## 4. Integrating Zod with React Hook Form

### Using zodResolver

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionFormData } from '@/schemas/transaction'

const TransactionForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: 'expense',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  })

  const onSubmit = async (data: TransactionFormData) => {
    await createTransaction(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

---

## 5. Building the Transaction Form

### Complete Form Implementation

```tsx
// src/components/transactions/TransactionForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionFormData } from '@/schemas/transaction'
import { useCategories } from '@/hooks/useCategories'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface TransactionFormProps {
  defaultValues?: Partial<TransactionFormData>
  onSubmit: (data: TransactionFormData) => Promise<void>
  onCancel?: () => void
}

export const TransactionForm = ({
  defaultValues,
  onSubmit,
  onCancel,
}: TransactionFormProps) => {
  const { data: categories = [] } = useCategories()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: 'expense',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      ...defaultValues,
    },
  })

  const selectedType = watch('type')

  // Filter categories by selected type
  const filteredCategories = categories.filter(
    (cat) => cat.type === selectedType
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Type Selection */}
      <div className="flex gap-2">
        <label className="flex-1">
          <input
            type="radio"
            {...register('type')}
            value="expense"
            className="sr-only peer"
          />
          <div className="p-3 text-center rounded-lg border cursor-pointer peer-checked:bg-danger-50 peer-checked:border-danger-500 peer-checked:text-danger-700 dark:peer-checked:bg-danger-900/20">
            Expense
          </div>
        </label>
        <label className="flex-1">
          <input
            type="radio"
            {...register('type')}
            value="income"
            className="sr-only peer"
          />
          <div className="p-3 text-center rounded-lg border cursor-pointer peer-checked:bg-success-50 peer-checked:border-success-500 peer-checked:text-success-700 dark:peer-checked:bg-success-900/20">
            Income
          </div>
        </label>
      </div>

      {/* Description */}
      <Input
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="e.g., Grocery shopping"
      />

      {/* Amount */}
      <Input
        label="Amount"
        type="number"
        step="0.01"
        {...register('amount', { valueAsNumber: true })}
        error={errors.amount?.message}
        placeholder="0.00"
      />

      {/* Category */}
      <Select
        label="Category"
        {...register('categoryId')}
        error={errors.categoryId?.message}
      >
        <option value="">Select a category</option>
        {filteredCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      {/* Date */}
      <Input
        label="Date"
        type="date"
        {...register('date')}
        error={errors.date?.message}
      />

      {/* Notes (optional) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Notes (optional)
        </label>
        <textarea
          {...register('notes')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          rows={3}
          placeholder="Add any additional notes..."
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-danger-600">{errors.notes.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          {defaultValues?.description ? 'Update' : 'Add'} Transaction
        </Button>
      </div>
    </form>
  )
}
```

---

## 6. Form State and Methods

### Useful Form State

```tsx
const {
  formState: {
    errors,        // Validation errors
    isSubmitting,  // Form is being submitted
    isValid,       // Form is valid
    isDirty,       // Form has been modified
    dirtyFields,   // Which fields have been modified
    touchedFields, // Which fields have been touched
  },
} = useForm()
```

### Useful Methods

```tsx
const {
  register,      // Register input
  handleSubmit,  // Handle form submission
  watch,         // Watch field values
  setValue,      // Set field value programmatically
  getValues,     // Get current values
  reset,         // Reset form
  trigger,       // Trigger validation
  setError,      // Set custom error
  clearErrors,   // Clear errors
} = useForm()
```

### Watching Values

```tsx
// Watch single field
const type = watch('type')

// Watch multiple fields
const [type, categoryId] = watch(['type', 'categoryId'])

// Watch all fields
const allValues = watch()

// Watch with callback
useEffect(() => {
  const subscription = watch((value, { name, type }) => {
    console.log(name, type, value)
  })
  return () => subscription.unsubscribe()
}, [watch])
```

### Programmatic Value Setting

```tsx
const { setValue, reset } = useForm()

// Set single value
setValue('amount', 100)

// Set with validation
setValue('amount', 100, {
  shouldValidate: true,
  shouldDirty: true,
})

// Reset entire form
reset()

// Reset with new values
reset({
  description: 'New description',
  amount: 50,
})
```

---

## 7. Reusable Form Components

### FormField Component

```tsx
// src/components/ui/FormField.tsx
import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface FormFieldProps {
  label: string
  error?: string
  children: ReactNode
  required?: boolean
  description?: string
}

export const FormField = ({
  label,
  error,
  children,
  required,
  description,
}: FormFieldProps) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-slate-500">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
      )}
    </div>
  )
}
```

### Select Component

```tsx
// src/components/ui/Select.tsx
import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm',
            'border-slate-300 bg-white text-slate-900',
            'dark:border-slate-600 dark:bg-slate-800 dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            error && 'border-danger-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="text-sm text-danger-600">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
```

---

## 8. Advanced Patterns

### Conditional Fields

```tsx
const Form = () => {
  const { register, watch } = useForm()
  const paymentMethod = watch('paymentMethod')

  return (
    <form>
      <select {...register('paymentMethod')}>
        <option value="card">Credit Card</option>
        <option value="bank">Bank Transfer</option>
      </select>

      {paymentMethod === 'card' && (
        <>
          <input {...register('cardNumber')} placeholder="Card Number" />
          <input {...register('cvv')} placeholder="CVV" />
        </>
      )}

      {paymentMethod === 'bank' && (
        <>
          <input {...register('accountNumber')} placeholder="Account Number" />
          <input {...register('routingNumber')} placeholder="Routing Number" />
        </>
      )}
    </form>
  )
}
```

### Field Arrays

```tsx
import { useFieldArray } from 'react-hook-form'

const Form = () => {
  const { control, register } = useForm({
    defaultValues: {
      items: [{ name: '', quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  return (
    <form>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`items.${index}.name`)} />
          <input
            type="number"
            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
          />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: '', quantity: 1 })}>
        Add Item
      </button>
    </form>
  )
}
```

### Custom Validation

```tsx
// In Zod schema
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Or with register
<input
  {...register('username', {
    validate: async (value) => {
      const exists = await checkUsernameExists(value)
      return !exists || 'Username already taken'
    },
  })}
/>
```

### Server Errors

```tsx
const { setError } = useForm()

const onSubmit = async (data: FormData) => {
  try {
    await submitForm(data)
  } catch (error) {
    if (error.field) {
      // Set error on specific field
      setError(error.field, {
        type: 'server',
        message: error.message,
      })
    } else {
      // Set root error
      setError('root', {
        type: 'server',
        message: 'Something went wrong',
      })
    }
  }
}

// Display root error
{errors.root && (
  <div className="text-danger-600">{errors.root.message}</div>
)}
```

---

## 9. Form Schemas for the App

### All Schemas

```tsx
// src/schemas/index.ts
import { z } from 'zod'

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register schema
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

// Transaction schema
export const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>

// Budget schema
export const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  month: z.string().min(1, 'Month is required'),
})

export type BudgetFormData = z.infer<typeof budgetSchema>
```

---

## Exercises

### Exercise 1: Login Form

Create a complete login form with:
- Email and password fields
- Validation with Zod
- Error display
- Submit handling
- Loading state

### Exercise 2: Budget Form

Create a budget form with:
- Category dropdown
- Amount input
- Month selector
- Validation

### Exercise 3: Search with Filters

Create a search form with:
- Search input
- Type filter (all/income/expense)
- Date range
- Reset button

---

## Checkpoint

At this point, you should have:
- ✅ Understanding of React Hook Form
- ✅ Ability to create Zod schemas
- ✅ Integration of Zod with React Hook Form
- ✅ Created the transaction form
- ✅ Knowledge of form state and methods

---

## Summary

In this module, we learned:
- React Hook Form provides efficient form handling
- Zod enables type-safe schema validation
- `zodResolver` integrates Zod with React Hook Form
- `register` connects inputs to the form
- `watch` observes field values reactively
- `formState` provides form status information
- Reusable form components improve consistency

## Next Steps

In the next module, we'll learn about TanStack Query for managing server state and data fetching.

[← Back to Module 05](../05-routing/README.md) | [Continue to Module 07: TanStack Query I →](../07-tanstack-query-i/README.md)
