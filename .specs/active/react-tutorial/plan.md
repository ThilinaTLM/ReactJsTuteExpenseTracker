# Plan: React Tutorial - Personal Finance Tracker

## Technical Approach

### Overview
Build the tutorial as a progressive learning experience where each module:
1. Introduces concepts with clear explanations
2. Implements a feature in the Finance Tracker app
3. Reinforces learning with exercises

The application code grows incrementally - by module 12, we have a complete app.

### Architecture Decisions

#### State Management Strategy
```
┌─────────────────────────────────────────────────────┐
│                    Application                       │
├─────────────────────────────────────────────────────┤
│  Server State (TanStack Query)                      │
│  - Transactions, Categories, Budgets                │
│  - Caching, Background refetch, Optimistic updates  │
├─────────────────────────────────────────────────────┤
│  Client State (Zustand)                             │
│  - Theme preference                                 │
│  - Filter states                                    │
│  - UI state (modals, sidebars)                     │
├─────────────────────────────────────────────────────┤
│  Local State (useState)                             │
│  - Form inputs                                      │
│  - Component-specific state                         │
└─────────────────────────────────────────────────────┘
```

#### Folder Structure (Final)
```
src/
├── components/
│   ├── ui/                 # Reusable UI (Button, Card, Modal, etc.)
│   ├── layout/             # Layout components (Header, Sidebar, etc.)
│   ├── dashboard/          # Dashboard-specific components
│   ├── transactions/       # Transaction components
│   ├── categories/         # Category components
│   ├── budgets/            # Budget components
│   └── charts/             # Chart components
├── hooks/
│   ├── useTransactions.ts  # TanStack Query hooks
│   ├── useCategories.ts
│   ├── useBudgets.ts
│   └── useAuth.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── Categories.tsx
│   ├── Budgets.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── NotFound.tsx
├── stores/
│   ├── useThemeStore.ts
│   ├── useFilterStore.ts
│   └── useAuthStore.ts
├── services/
│   └── api.ts              # API client configuration
├── types/
│   └── index.ts            # TypeScript interfaces
├── utils/
│   ├── format.ts           # Currency, date formatting
│   └── constants.ts        # App constants
├── App.tsx
├── main.tsx
└── index.css
```

---

## Module Breakdown

### Module 00: Introduction
**Goal**: Set expectations and motivate learners
**Deliverables**:
- Course overview document
- Final app screenshots/demo
- Prerequisites checklist
- Learning path diagram

---

### Module 01: Project Setup
**Goal**: Scaffold the project with all tooling
**Concepts**: Vite, TypeScript config, Tailwind setup, ESLint/Prettier
**App Progress**: Empty project with tooling configured

**Implementation**:
1. Create Vite project with React + TypeScript
2. Install and configure Tailwind CSS
3. Set up ESLint and Prettier
4. Create folder structure
5. Configure path aliases
6. Set up mock API (json-server)

**Files Created**:
- `vite.config.ts`
- `tailwind.config.js`
- `tsconfig.json`
- `.eslintrc.cjs`
- `.prettierrc`
- `api/db.json`
- `api/routes.json`

---

### Module 02: React Basics
**Goal**: Understand core React concepts
**Concepts**: JSX, Components, Props, Lists, Conditional Rendering
**App Progress**: Static dashboard layout with mock data

**Implementation**:
1. Create basic UI components (Card, Button)
2. Build static Dashboard layout
3. Create StatCard component with props
4. Render transaction list from array
5. Conditional rendering for empty states

**Files Created**:
- `src/components/ui/Card.tsx`
- `src/components/ui/Button.tsx`
- `src/components/dashboard/StatCard.tsx`
- `src/components/dashboard/TransactionList.tsx`
- `src/pages/Dashboard.tsx`
- `src/types/index.ts`

---

### Module 03: React Hooks I
**Goal**: Master useState and useEffect
**Concepts**: useState, useEffect, Event Handling, Controlled Inputs
**App Progress**: Interactive filters, theme toggle (local state)

**Implementation**:
1. Add filter state to transactions
2. Create search input with controlled state
3. Implement theme toggle with useState
4. useEffect for document title
5. useEffect for localStorage sync

**Files Created**:
- `src/components/transactions/TransactionFilters.tsx`
- `src/components/ui/SearchInput.tsx`
- `src/components/ui/ThemeToggle.tsx`

---

### Module 04: React Hooks II
**Goal**: Advanced hooks and custom hooks
**Concepts**: useContext, useReducer, useRef, useMemo, useCallback, Custom Hooks
**App Progress**: Theme context, filter reducer, custom hooks

**Implementation**:
1. Create ThemeContext with useContext
2. Refactor filters with useReducer
3. useRef for input focus
4. useMemo for expensive calculations
5. Create custom useLocalStorage hook
6. Create custom useDebounce hook

**Files Created**:
- `src/contexts/ThemeContext.tsx`
- `src/hooks/useLocalStorage.ts`
- `src/hooks/useDebounce.ts`
- `src/reducers/filterReducer.ts`

---

### Module 05: React Router
**Goal**: Implement client-side routing
**Concepts**: Routes, Navigation, URL Params, Nested Routes, Protected Routes
**App Progress**: Multi-page app with navigation

**Implementation**:
1. Set up React Router
2. Create page components
3. Build navigation/sidebar
4. Implement nested routes for transactions
5. Create ProtectedRoute component (placeholder)
6. Handle 404 page

**Files Created**:
- `src/components/layout/Layout.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Header.tsx`
- `src/pages/Transactions.tsx`
- `src/pages/Categories.tsx`
- `src/pages/Budgets.tsx`
- `src/pages/NotFound.tsx`
- `src/components/auth/ProtectedRoute.tsx`

---

### Module 06: Forms & Validation
**Goal**: Build robust forms
**Concepts**: React Hook Form, Zod Schemas, Error Handling, Form UX
**App Progress**: Transaction form with validation

**Implementation**:
1. Install React Hook Form and Zod
2. Create Zod schemas for transaction
3. Build TransactionForm component
4. Implement field validation
5. Handle form submission
6. Create reusable form components

**Files Created**:
- `src/schemas/transaction.ts`
- `src/components/transactions/TransactionForm.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Select.tsx`
- `src/components/ui/DatePicker.tsx`
- `src/components/ui/FormField.tsx`

---

### Module 07: TanStack Query I
**Goal**: Fetch and cache server data
**Concepts**: Queries, Loading States, Error States, Caching, Stale Time
**App Progress**: Real data from mock API

**Implementation**:
1. Set up TanStack Query provider
2. Create API service layer
3. Implement useTransactions query
4. Add loading skeletons
5. Implement error boundaries
6. Configure caching strategies

**Files Created**:
- `src/services/api.ts`
- `src/services/transactions.ts`
- `src/hooks/useTransactions.ts`
- `src/components/ui/Skeleton.tsx`
- `src/components/ui/ErrorBoundary.tsx`

---

### Module 08: TanStack Query II
**Goal**: Mutations and advanced patterns
**Concepts**: Mutations, Optimistic Updates, Invalidation, Infinite Queries
**App Progress**: Full CRUD for transactions

**Implementation**:
1. Create mutation hooks
2. Implement optimistic updates
3. Handle mutation errors with rollback
4. Add infinite scroll for transactions
5. Implement prefetching

**Files Modified/Created**:
- `src/hooks/useTransactions.ts` (extended)
- `src/hooks/useCategories.ts`
- `src/components/transactions/TransactionList.tsx` (infinite scroll)
- `src/components/ui/Toast.tsx`

---

### Module 09: Zustand
**Goal**: Global client state management
**Concepts**: Stores, Actions, Selectors, Persistence, Devtools
**App Progress**: Persistent theme, global filters

**Implementation**:
1. Set up Zustand
2. Create theme store with persistence
3. Create filter store
4. Migrate from Context to Zustand
5. Add devtools middleware

**Files Created**:
- `src/stores/useThemeStore.ts`
- `src/stores/useFilterStore.ts`
- `src/stores/useUIStore.ts`

---

### Module 10: Charts & Visualization
**Goal**: Data visualization with Recharts
**Concepts**: Recharts Components, Data Transformation, Responsive Charts
**App Progress**: Dashboard with interactive charts

**Implementation**:
1. Install Recharts
2. Create spending by category pie chart
3. Create monthly trend bar chart
4. Create budget progress charts
5. Add tooltips and legends
6. Make charts responsive

**Files Created**:
- `src/components/charts/SpendingPieChart.tsx`
- `src/components/charts/MonthlyTrendChart.tsx`
- `src/components/charts/BudgetProgressChart.tsx`
- `src/utils/chartHelpers.ts`

---

### Module 11: Authentication
**Goal**: Implement auth flow
**Concepts**: Auth Context, Protected Routes, Login/Logout, Session Persistence
**App Progress**: Complete auth system (mock)

**Implementation**:
1. Create auth store with Zustand
2. Build Login page
3. Build Register page
4. Implement ProtectedRoute logic
5. Add auth to API calls
6. Handle session expiry

**Files Created/Modified**:
- `src/stores/useAuthStore.ts`
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/schemas/auth.ts`
- `src/components/auth/ProtectedRoute.tsx` (updated)
- `src/services/auth.ts`

---

### Module 12: Polish & Optimization
**Goal**: Production-ready polish
**Concepts**: Performance, Accessibility, Code Splitting, Deployment
**App Progress**: Complete, polished application

**Implementation**:
1. Add React.memo to expensive components
2. Implement code splitting with lazy()
3. Add Suspense boundaries
4. Accessibility audit and fixes
5. Add keyboard navigation
6. Performance profiling
7. Build configuration
8. Deployment guide (Vercel/Netlify)

**Files Modified**:
- Various components (memoization)
- `src/App.tsx` (lazy loading)
- `vite.config.ts` (build optimization)

---

## Mock API Design

### db.json Structure
```json
{
  "users": [
    {
      "id": "1",
      "email": "demo@example.com",
      "password": "password123",
      "name": "Demo User",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "transactions": [
    {
      "id": "1",
      "userId": "1",
      "type": "expense",
      "amount": 45.99,
      "category": "food",
      "description": "Grocery shopping",
      "date": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "categories": [
    {
      "id": "1",
      "name": "Food",
      "icon": "utensils",
      "color": "#ef4444",
      "type": "expense"
    }
  ],
  "budgets": [
    {
      "id": "1",
      "userId": "1",
      "categoryId": "1",
      "amount": 500,
      "month": "2024-01"
    }
  ]
}
```

### Seed Data Script
Create a script to generate 50+ realistic transactions across 3 months.

---

## Dependencies

### Production
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "@tanstack/react-query": "^5.8.0",
  "zustand": "^4.4.0",
  "react-hook-form": "^7.48.0",
  "@hookform/resolvers": "^3.3.0",
  "zod": "^3.22.0",
  "recharts": "^2.10.0",
  "lucide-react": "^0.294.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0",
  "date-fns": "^2.30.0"
}
```

### Development
```json
{
  "typescript": "^5.2.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0",
  "tailwindcss": "^3.3.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0",
  "eslint": "^8.54.0",
  "prettier": "^3.1.0",
  "json-server": "^0.17.4"
}
```

---

## Checkpoints

| After Module | User Can... |
|--------------|-------------|
| 01 | Run empty project with tooling |
| 02 | See static dashboard with components |
| 03 | Interact with filters and theme toggle |
| 04 | Use app with proper context and custom hooks |
| 05 | Navigate between pages |
| 06 | Add transactions via validated form |
| 07 | See real data from mock API |
| 08 | Perform full CRUD with optimistic updates |
| 09 | Have persistent theme and global state |
| 10 | View interactive charts and analytics |
| 11 | Login/logout with protected routes |
| 12 | Deploy production-ready app |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Tutorial too long | Clear time estimates per module, allow skipping |
| Concepts too complex | Build complexity gradually, provide "deep dive" optional sections |
| API changes break tutorial | Pin all dependency versions |
| Learner gets stuck | Provide completed code per module as reference |
