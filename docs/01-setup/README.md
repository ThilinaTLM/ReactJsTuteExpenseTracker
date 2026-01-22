# Module 01: Project Setup

## Overview

In this module, we'll set up our development environment and create the foundation for our React application. We'll configure Vite, TypeScript, Tailwind CSS, and set up a mock API using json-server.

## Learning Objectives

- Create a React project with Vite
- Configure TypeScript for type safety
- Set up Tailwind CSS for styling
- Configure ESLint and Prettier for code quality
- Create a mock API with json-server
- Understand the project structure

## Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- Basic command line knowledge

---

## 1. Creating the Project

### Using Vite

Vite is a modern build tool that provides fast development experience with hot module replacement (HMR) and optimized builds.

```bash
npm create vite@latest react-finance-tracker -- --template react-ts
cd react-finance-tracker
npm install
```

### Initial Dependencies

Install the production dependencies:

```bash
npm install react-router-dom @tanstack/react-query zustand react-hook-form @hookform/resolvers zod recharts lucide-react clsx tailwind-merge date-fns
```

Install development dependencies:

```bash
npm install -D tailwindcss postcss autoprefixer @types/node json-server concurrently
```

---

## 2. Configuring TypeScript

Update `tsconfig.json` with path aliases for cleaner imports:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "types": ["vite/client"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

Update `vite.config.ts` to handle the alias:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

---

## 3. Setting Up Tailwind CSS

Initialize Tailwind:

```bash
npx tailwindcss init -p
```

Configure `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
    },
  },
  plugins: [],
}
```

Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50;
  }
}
```

---

## 4. Project Structure

Create the following folder structure:

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/       # Layout components
│   ├── dashboard/    # Dashboard-specific
│   ├── transactions/ # Transaction components
│   ├── charts/       # Chart components
│   └── auth/         # Auth components
├── hooks/            # Custom hooks
├── pages/            # Page components
├── stores/           # Zustand stores
├── services/         # API services
├── types/            # TypeScript types
├── utils/            # Utility functions
├── schemas/          # Zod schemas
├── App.tsx
├── main.tsx
└── index.css
```

Create directories:

```bash
mkdir -p src/{components/{ui,layout,dashboard,transactions,charts,auth},hooks,pages,stores,services,types,utils,schemas}
```

---

## 5. Mock API Setup

Create `api/db.json` with seed data:

```json
{
  "users": [
    {
      "id": "1",
      "email": "demo@example.com",
      "password": "password123",
      "name": "Demo User"
    }
  ],
  "categories": [
    {"id": "1", "name": "Food & Dining", "icon": "utensils", "color": "#ef4444", "type": "expense"},
    {"id": "2", "name": "Transportation", "icon": "car", "color": "#f97316", "type": "expense"},
    {"id": "9", "name": "Salary", "icon": "briefcase", "color": "#22c55e", "type": "income"}
  ],
  "transactions": [],
  "budgets": []
}
```

Create `api/server.js`:

```javascript
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('api/db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Simulate network delay
server.use((req, res, next) => {
  setTimeout(next, 300 + Math.random() * 500);
});

server.use(router);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`);
});
```

---

## 6. NPM Scripts

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "api": "node api/server.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run api\""
  }
}
```

---

## 7. Running the Project

Start both the frontend and API:

```bash
npm run dev:all
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

---

## Checkpoint

At this point, you should have:
- ✅ Vite project with React and TypeScript
- ✅ Tailwind CSS configured
- ✅ Project folder structure created
- ✅ Mock API running with json-server
- ✅ Both dev servers running

---

## Summary

In this module, we:
- Created a new React project with Vite and TypeScript
- Configured Tailwind CSS for utility-first styling
- Set up path aliases for cleaner imports
- Created a mock API with json-server
- Established our project structure

## Next Steps

In the next module, we'll learn React basics by building our first components.

[← Back to Introduction](../00-introduction/README.md) | [Continue to Module 02: React Basics →](../02-react-basics/README.md)
