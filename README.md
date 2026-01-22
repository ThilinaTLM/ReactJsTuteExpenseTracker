# React Tutorial: Personal Finance Tracker

A comprehensive React.js tutorial that teaches modern React development by building a fully functional personal finance tracking application from scratch.

## What You'll Learn

- React 19 fundamentals (components, props, state, hooks)
- TypeScript for type-safe development
- Client-side routing with React Router
- Form handling with React Hook Form + Zod validation
- Server state management with TanStack Query
- Global state management with Zustand
- Data visualization with Recharts
- Authentication flow implementation
- Performance optimization techniques

## Prerequisites

- Basic HTML, CSS, and JavaScript knowledge
- Node.js 18+ installed
- A code editor (VS Code recommended)

## Quick Start

```bash
# Install dependencies
npm install

# Start both frontend and mock API
npm run dev:all
```

Then open http://localhost:5173 in your browser.

**Demo Login:** `demo@example.com` / `password123`

## How to Use This Tutorial

### Option 1: Follow Along (Recommended)

Work through the tutorial modules in order. Each module builds on the previous one:

| Module | Topic | File |
|--------|-------|------|
| 00 | Introduction | [docs/00-introduction/README.md](docs/00-introduction/README.md) |
| 01 | Project Setup | [docs/01-setup/README.md](docs/01-setup/README.md) |
| 02 | React Basics | [docs/02-react-basics/README.md](docs/02-react-basics/README.md) |
| 03 | React Hooks I | [docs/03-hooks-i/README.md](docs/03-hooks-i/README.md) |
| 04 | React Hooks II | [docs/04-hooks-ii/README.md](docs/04-hooks-ii/README.md) |
| 05 | React Router | [docs/05-routing/README.md](docs/05-routing/README.md) |
| 06 | Forms & Validation | [docs/06-forms/README.md](docs/06-forms/README.md) |
| 07 | TanStack Query I | [docs/07-tanstack-query-i/README.md](docs/07-tanstack-query-i/README.md) |
| 08 | TanStack Query II | [docs/08-tanstack-query-ii/README.md](docs/08-tanstack-query-ii/README.md) |
| 09 | Zustand | [docs/09-zustand/README.md](docs/09-zustand/README.md) |
| 10 | Charts | [docs/10-charts/README.md](docs/10-charts/README.md) |
| 11 | Authentication | [docs/11-auth/README.md](docs/11-auth/README.md) |
| 12 | Polish & Optimization | [docs/12-polish/README.md](docs/12-polish/README.md) |

### Option 2: Explore the Completed App

Run the app and explore the codebase to see how everything works together:

```bash
npm run dev:all
```

Browse the features:
- **Dashboard** - Overview with charts and stats
- **Transactions** - Full CRUD with filtering
- **Categories** - Expense/income categories
- **Budgets** - Monthly budget tracking

### Option 3: Use as Reference

Study the code structure:

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Base components (Button, Card, Input...)
│   ├── layout/      # Layout components (Sidebar, Header)
│   ├── charts/      # Chart components
│   └── transactions/# Transaction-specific components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── stores/          # Zustand state stores
├── services/        # API service layer
├── schemas/         # Zod validation schemas
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run api` | Start mock API server |
| `npm run dev:all` | Start both frontend and API |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI library |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router | Routing |
| React Hook Form | Form handling |
| Zod | Validation |
| TanStack Query | Server state |
| Zustand | Client state |
| Recharts | Charts |
| json-server | Mock API |

## Tips for Beginners

1. **Don't skip modules** - Each one builds on the previous
2. **Type the code yourself** - Don't just copy/paste
3. **Experiment** - Break things and fix them
4. **Use the running app** - Compare your code to the working version
5. **Read the code comments** - They explain the "why"

## Project Structure

```
ReactTutorialExpenseTracker/
├── api/                 # Mock API (json-server)
│   ├── db.json         # Database with seed data
│   └── server.js       # API server config
├── docs/               # Tutorial documentation
│   └── 00-12/          # Module READMEs
├── src/                # React application source
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## License

MIT - Feel free to use this for learning!
