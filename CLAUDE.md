# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React 19 personal finance tracker tutorial application with TypeScript, featuring transaction management, budget tracking, and data visualization.

## Commands

```bash
# Development (starts both frontend and mock API)
npm run dev:all

# Frontend only (Vite dev server on port 5173)
npm run dev

# Mock API only (json-server on port 3001)
npm run api

# Seed the database with sample data
npm run api:seed

# Build for production
npm run build

# Lint
npm run lint
```

**Demo credentials:** `demo@example.com` / `password123`

## Architecture

### Data Flow Pattern

1. **API Layer** (`src/services/api.ts`): Singleton `ApiClient` class handles all HTTP requests with automatic auth token injection from Zustand store and 401 logout handling
2. **Service Layer** (`src/services/*.ts`): Domain-specific services (transactions, categories, budgets, auth) that use the API client
3. **React Query Hooks** (`src/hooks/*.ts`): Custom hooks wrapping TanStack Query with optimistic updates and cache invalidation
4. **Components**: Consume hooks and render UI

### State Management

- **Server State**: TanStack Query (`@tanstack/react-query`) - handles caching, refetching, optimistic updates
- **Client State**: Zustand stores in `src/stores/`:
  - `useAuthStore`: Auth state with localStorage persistence
  - `useFilterStore`: Transaction filter state
  - `useUIStore`: UI state (modals, toasts, theme)

### Key Patterns

- **Path alias**: `@/` maps to `src/` (configured in vite.config.ts and tsconfig.json)
- **Form validation**: Zod schemas in `src/schemas/` with React Hook Form via `@hookform/resolvers`
- **Lazy loading**: Pages are lazy-loaded in App.tsx for code splitting
- **Protected routes**: `ProtectedRoute` component wraps authenticated routes
- **API proxy**: Vite proxies `/api` requests to `http://localhost:3001` (json-server)

### Mock API

The `api/` directory contains a json-server setup:
- `db.json`: Database file with users, transactions, categories, budgets
- `server.js`: Custom endpoints for `/login` and `/register`, plus simulated network delay (300-800ms)
- Supports standard REST operations plus json-server query params (`_page`, `_limit`, `q`, etc.)
