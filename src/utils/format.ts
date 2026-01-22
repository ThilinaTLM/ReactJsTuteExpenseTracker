import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Format a number as compact currency (e.g., $1.5K)
 */
export function formatCompactCurrency(amount: number): string {
  if (Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`
  }
  return formatCurrency(amount)
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string, formatStr: string = 'MMM d, yyyy'): string {
  const date = parseISO(dateString)
  if (!isValid(date)) {
    return 'Invalid date'
  }
  return format(date, formatStr)
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = parseISO(dateString)
  if (!isValid(date)) {
    return 'Invalid date'
  }
  return formatDistanceToNow(date, { addSuffix: true })
}

/**
 * Format a date for input[type="date"]
 */
export function formatDateForInput(dateString: string): string {
  const date = parseISO(dateString)
  if (!isValid(date)) {
    return ''
  }
  return format(date, 'yyyy-MM-dd')
}

/**
 * Format a date for datetime-local input
 */
export function formatDateTimeForInput(dateString: string): string {
  const date = parseISO(dateString)
  if (!isValid(date)) {
    return ''
  }
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

/**
 * Get month string for budget (YYYY-MM)
 */
export function getMonthString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM')
}

/**
 * Format month string for display (e.g., "January 2024")
 */
export function formatMonth(monthString: string): string {
  const [year, month] = monthString.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return format(date, 'MMMM yyyy')
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return `${text.slice(0, maxLength)}...`
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}
