import { z } from 'zod'
import { VALIDATION } from '@/utils/constants'

/**
 * Schema for login form
 */
export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(1, 'Password is required'),
})

/**
 * Schema for registration form
 */
export const registerSchema = z
  .object({
    name: z
      .string({
        required_error: 'Name is required',
      })
      .min(1, 'Name is required')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(
        VALIDATION.MIN_PASSWORD_LENGTH,
        `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`
      ),
    confirmPassword: z.string({
      required_error: 'Please confirm your password',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

/**
 * Type inference from schemas
 */
export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
