# Module 02: React Basics

## Overview

In this module, we'll learn the fundamental building blocks of React: components, props, and JSX. We'll create our first reusable UI components for the finance tracker application.

## Learning Objectives

- Understand components and the component tree
- Work with props for passing data between components
- Master JSX syntax and expressions
- Create reusable UI components
- Implement component composition patterns

## Prerequisites

- Module 01 completed (project setup)
- Basic JavaScript/TypeScript knowledge

---

## 1. Understanding Components

### What is a Component?

A React component is a reusable piece of UI that can contain its own structure (JSX), styling, and logic. Components are the building blocks of React applications.

### Function Components

Modern React uses function components exclusively:

```tsx
// A simple component
function Greeting() {
  return <h1>Hello, World!</h1>
}

// Arrow function syntax (preferred in this project)
const Greeting = () => {
  return <h1>Hello, World!</h1>
}

// With implicit return
const Greeting = () => <h1>Hello, World!</h1>
```

### Component Naming Convention

- Use PascalCase for component names: `Button`, `TransactionList`, `DashboardCard`
- One component per file (usually)
- File name matches component name: `Button.tsx`

---

## 2. JSX Syntax

### What is JSX?

JSX is a syntax extension that lets you write HTML-like markup inside JavaScript. It gets compiled to regular JavaScript function calls.

```tsx
// JSX
const element = <h1 className="title">Hello</h1>

// Compiles to
const element = React.createElement('h1', { className: 'title' }, 'Hello')
```

### JSX Rules

1. **Return a single root element**
```tsx
// ❌ Invalid - multiple roots
const Bad = () => {
  return (
    <h1>Title</h1>
    <p>Content</p>
  )
}

// ✅ Valid - single root
const Good = () => {
  return (
    <div>
      <h1>Title</h1>
      <p>Content</p>
    </div>
  )
}

// ✅ Valid - using Fragment
const AlsoGood = () => {
  return (
    <>
      <h1>Title</h1>
      <p>Content</p>
    </>
  )
}
```

2. **Close all tags**
```tsx
// Self-closing tags
<img src="photo.jpg" />
<input type="text" />
<br />
```

3. **Use camelCase for attributes**
```tsx
// HTML: class, onclick, tabindex
// JSX: className, onClick, tabIndex
<div className="container" onClick={handleClick} tabIndex={0}>
```

### JavaScript Expressions in JSX

Use curly braces `{}` to embed JavaScript:

```tsx
const name = 'Alice'
const items = ['Apple', 'Banana', 'Cherry']

const Component = () => {
  return (
    <div>
      {/* Variables */}
      <p>Hello, {name}!</p>

      {/* Expressions */}
      <p>2 + 2 = {2 + 2}</p>

      {/* Function calls */}
      <p>Uppercase: {name.toUpperCase()}</p>

      {/* Conditional rendering */}
      <p>{name ? `Welcome, ${name}` : 'Please log in'}</p>

      {/* Mapping arrays */}
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 3. Props

### What are Props?

Props (short for "properties") are how we pass data from parent to child components. They're read-only and flow in one direction: parent → child.

### Passing Props

```tsx
// Parent component
const App = () => {
  return (
    <Card title="Dashboard" subtitle="Overview of your finances" />
  )
}

// Child component receiving props
interface CardProps {
  title: string
  subtitle: string
}

const Card = ({ title, subtitle }: CardProps) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  )
}
```

### Props with TypeScript

Always define prop types with interfaces:

```tsx
interface ButtonProps {
  label: string
  variant?: 'primary' | 'secondary' | 'danger'  // Optional with union type
  disabled?: boolean                             // Optional boolean
  onClick?: () => void                          // Optional function
}

const Button = ({
  label,
  variant = 'primary',  // Default value
  disabled = false,
  onClick
}: ButtonProps) => {
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
```

### The `children` Prop

The special `children` prop allows components to wrap other content:

```tsx
interface CardProps {
  title: string
  children: React.ReactNode  // Can be any renderable content
}

const Card = ({ title, children }: CardProps) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-content">
        {children}
      </div>
    </div>
  )
}

// Usage
const App = () => {
  return (
    <Card title="Welcome">
      <p>This is the card content.</p>
      <button>Click me</button>
    </Card>
  )
}
```

---

## 4. Building UI Components

Let's build the core UI components for our finance tracker.

### Card Component

Create `src/components/ui/Card.tsx`:

```tsx
import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div className={cn(
      'rounded-xl border border-slate-200 bg-white shadow-sm',
      'dark:border-slate-700 dark:bg-slate-800',
      className
    )}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export const CardHeader = ({ children, className }: CardHeaderProps) => {
  return (
    <div className={cn('px-6 py-4 border-b border-slate-200 dark:border-slate-700', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export const CardTitle = ({ children, className }: CardTitleProps) => {
  return (
    <h3 className={cn('text-lg font-semibold text-slate-900 dark:text-white', className)}>
      {children}
    </h3>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export const CardContent = ({ children, className }: CardContentProps) => {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}
```

### Button Component

Create `src/components/ui/Button.tsx`:

```tsx
import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-500 dark:text-slate-300 dark:hover:bg-slate-800',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  }

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
}
```

### Input Component

Create `src/components/ui/Input.tsx`:

```tsx
import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm',
            'border-slate-300 bg-white text-slate-900',
            'dark:border-slate-600 dark:bg-slate-800 dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'disabled:bg-slate-50 disabled:cursor-not-allowed dark:disabled:bg-slate-900',
            error && 'border-danger-500 focus:ring-danger-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

### Utility Function for ClassNames

Create `src/utils/cn.ts`:

```tsx
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

This utility combines `clsx` for conditional classes and `tailwind-merge` to properly merge Tailwind classes.

---

## 5. Component Composition

### Compound Components Pattern

Compound components work together to form a cohesive unit:

```tsx
// Usage
<Card>
  <CardHeader>
    <CardTitle>Monthly Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Your spending this month...</p>
  </CardContent>
</Card>
```

### Render Props Pattern

Pass a function as a child or prop:

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item, index)}</li>
      ))}
    </ul>
  )
}

// Usage
<List
  items={['Apple', 'Banana', 'Cherry']}
  renderItem={(item, index) => <span>{index + 1}. {item}</span>}
/>
```

---

## 6. Conditional Rendering

### Using Ternary Operator

```tsx
const Status = ({ isOnline }: { isOnline: boolean }) => {
  return (
    <span className={isOnline ? 'text-green-500' : 'text-red-500'}>
      {isOnline ? 'Online' : 'Offline'}
    </span>
  )
}
```

### Using Logical AND

```tsx
const Notification = ({ count }: { count: number }) => {
  return (
    <div>
      {count > 0 && (
        <span className="badge">{count} new notifications</span>
      )}
    </div>
  )
}
```

### Using Early Returns

```tsx
const UserProfile = ({ user }: { user: User | null }) => {
  if (!user) {
    return <p>Please log in</p>
  }

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

---

## 7. Lists and Keys

### Rendering Lists

```tsx
interface Transaction {
  id: string
  description: string
  amount: number
}

const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  return (
    <ul>
      {transactions.map((transaction) => (
        <li key={transaction.id}>
          {transaction.description}: ${transaction.amount}
        </li>
      ))}
    </ul>
  )
}
```

### Why Keys Matter

Keys help React identify which items have changed, been added, or removed:

```tsx
// ❌ Bad - using index as key (can cause issues with reordering)
{items.map((item, index) => (
  <Item key={index} data={item} />
))}

// ✅ Good - using unique identifier
{items.map((item) => (
  <Item key={item.id} data={item} />
))}
```

---

## Exercises

### Exercise 1: Create a Badge Component

Create a `Badge` component that displays a small label with different color variants.

```tsx
// Expected usage:
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Failed</Badge>
```

### Exercise 2: Create a StatCard Component

Create a `StatCard` component for displaying dashboard statistics:

```tsx
// Expected usage:
<StatCard
  title="Total Balance"
  value="$12,450.00"
  change={+5.2}
  icon={<DollarSign />}
/>
```

### Exercise 3: Build a Transaction Item

Create a `TransactionItem` component that displays a single transaction:

```tsx
// Expected usage:
<TransactionItem
  transaction={{
    id: '1',
    description: 'Grocery Shopping',
    amount: -85.50,
    category: 'Food & Dining',
    date: '2024-01-15',
  }}
/>
```

---

## Checkpoint

At this point, you should have:
- ✅ Understanding of React components
- ✅ Knowledge of JSX syntax rules
- ✅ Ability to pass and use props
- ✅ Created Card, Button, and Input components
- ✅ Understanding of component composition

---

## Summary

In this module, we learned:
- Components are reusable pieces of UI
- JSX allows writing HTML-like syntax in JavaScript
- Props pass data from parent to child components
- TypeScript interfaces define prop types
- The `children` prop enables component composition
- Conditional rendering with ternary, &&, and early returns
- Keys are essential when rendering lists

## Next Steps

In the next module, we'll learn about React's state management with the `useState` hook and understand how to make our components interactive.

[← Back to Module 01](../01-setup/README.md) | [Continue to Module 03: React Hooks I →](../03-hooks-i/README.md)
