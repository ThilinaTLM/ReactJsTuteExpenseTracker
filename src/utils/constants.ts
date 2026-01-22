// API Configuration
export const API_BASE_URL = '/api'
export const API_TIMEOUT = 10000 // 10 seconds

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  THEME: 'theme',
  FILTERS: 'transaction_filters',
} as const

// Transaction types
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const

// Category icons mapping (Lucide icon names)
export const CATEGORY_ICONS: Record<string, string> = {
  utensils: 'UtensilsCrossed',
  car: 'Car',
  film: 'Film',
  'shopping-bag': 'ShoppingBag',
  'file-text': 'FileText',
  'heart-pulse': 'HeartPulse',
  'graduation-cap': 'GraduationCap',
  'more-horizontal': 'MoreHorizontal',
  briefcase: 'Briefcase',
  laptop: 'Laptop',
  'trending-up': 'TrendingUp',
  'plus-circle': 'PlusCircle',
} as const

// Default category colors
export const DEFAULT_CATEGORY_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#0ea5e9', // Sky
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
] as const

// Budget alert thresholds
export const BUDGET_THRESHOLDS = {
  WARNING: 80, // Show warning at 80%
  DANGER: 100, // Show danger at 100%
} as const

// Date range presets
export const DATE_RANGE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Last 3 Months', value: 'last_3_months' },
  { label: 'This Year', value: 'this_year' },
  { label: 'All Time', value: 'all_time' },
] as const

// Chart colors
export const CHART_COLORS = {
  income: '#22c55e',
  expense: '#ef4444',
  primary: '#3b82f6',
  secondary: '#64748b',
  grid: '#e2e8f0',
  gridDark: '#334155',
} as const

// Toast durations (ms)
export const TOAST_DURATIONS = {
  short: 3000,
  medium: 5000,
  long: 8000,
} as const

// Animation durations (ms)
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const

// Navigation items
export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/transactions', label: 'Transactions', icon: 'ArrowLeftRight' },
  { path: '/categories', label: 'Categories', icon: 'Tags' },
  { path: '/budgets', label: 'Budgets', icon: 'PiggyBank' },
] as const

// Validation rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_DESCRIPTION_LENGTH: 200,
  MAX_CATEGORY_NAME_LENGTH: 50,
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 999999999.99,
} as const
