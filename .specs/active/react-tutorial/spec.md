# Specification: React Tutorial - Personal Finance Tracker

## Purpose
Create a comprehensive, hands-on React.js tutorial that teaches modern React development by progressively building a fully functional Personal Finance Tracker application.

---

## User Stories

### US-1: Tutorial Learner Experience
**AS A** developer learning React
**I WANT** step-by-step tutorial modules with clear explanations
**SO THAT** I can understand and apply React concepts progressively

**Acceptance Criteria:**
- Each module has clear learning objectives
- Code examples are complete and runnable
- Concepts are explained before implementation
- Each module builds on previous modules
- Exercises reinforce learning

### US-2: Complete Application
**AS A** tutorial completer
**I WANT** a fully functional finance tracker app
**SO THAT** I have a portfolio-worthy project demonstrating my skills

**Acceptance Criteria:**
- Application tracks income and expenses
- Dashboard shows financial summary
- Charts visualize spending patterns
- Categories organize transactions
- Budget goals with progress tracking
- Dark/light theme support
- Authentication flow (mock)

### US-3: Real-World Patterns
**AS A** aspiring professional developer
**I WANT** to learn industry-standard patterns and tools
**SO THAT** I'm prepared for real-world React projects

**Acceptance Criteria:**
- TypeScript throughout
- Proper state management patterns
- API integration with caching
- Form validation
- Error handling
- Performance optimization techniques

---

## Requirements

### Tutorial Structure

#### REQ-T1: Module Organization
The tutorial SHALL be organized into 12 progressive modules:

| Module | Title | Key Concepts |
|--------|-------|--------------|
| 00 | Introduction | Course overview, what we'll build |
| 01 | Project Setup | Vite, TypeScript, Tailwind, project structure |
| 02 | React Basics | JSX, components, props, lists, conditional rendering |
| 03 | React Hooks I | useState, useEffect, event handling |
| 04 | React Hooks II | useContext, useReducer, useRef, custom hooks |
| 05 | React Router | Routing, navigation, protected routes |
| 06 | Forms & Validation | React Hook Form, Zod, error handling |
| 07 | TanStack Query I | Queries, loading/error states, caching |
| 08 | TanStack Query II | Mutations, optimistic updates, invalidation |
| 09 | Zustand | Global state, slices, persistence |
| 10 | Charts & Visualization | Recharts, data transformation |
| 11 | Authentication | Auth flow, protected routes, context |
| 12 | Polish & Optimization | Performance, accessibility, deployment |

#### REQ-T2: Module Format
Each module MUST include:
- **Overview**: What will be learned (2-3 sentences)
- **Learning Objectives**: Bulleted list (3-5 items)
- **Prerequisites**: Required prior knowledge/modules
- **Concepts**: Theory explanation with examples
- **Implementation**: Step-by-step coding instructions
- **Checkpoint**: What the app looks like after this module
- **Exercises**: 2-3 practice problems
- **Summary**: Key takeaways
- **Next Steps**: Preview of next module

#### REQ-T3: Code Examples
All code examples SHALL:
- Be complete and runnable (no pseudo-code)
- Include TypeScript types
- Have inline comments for complex logic
- Show file paths for context
- Use consistent formatting

### Application Features

#### REQ-A1: Dashboard
The application SHALL display a dashboard with:
- Total balance (income - expenses)
- Income summary for current month
- Expense summary for current month
- Recent transactions list (last 5)
- Spending by category chart (pie/donut)
- Monthly trend chart (bar/line)

#### REQ-A2: Transactions
The application SHALL support transaction management:
- List all transactions with pagination
- Filter by type (income/expense), category, date range
- Search transactions by description
- Add new transaction (type, amount, category, date, description)
- Edit existing transaction
- Delete transaction with confirmation
- Optimistic UI updates

#### REQ-A3: Categories
The application SHALL support category management:
- Default categories (Food, Transport, Entertainment, Bills, Shopping, Health, Other)
- Custom category creation
- Category icons/colors
- Category-based filtering

#### REQ-A4: Budget Goals
The application SHALL support budget tracking:
- Set monthly budget goals per category
- Visual progress indicators
- Warning when approaching limit (80%)
- Alert when exceeded

#### REQ-A5: User Interface
The application SHALL provide:
- Responsive design (mobile, tablet, desktop)
- Dark/light theme toggle with persistence
- Loading states and skeletons
- Error states with retry options
- Toast notifications for actions
- Accessible components (ARIA)

#### REQ-A6: Authentication (Mock)
The application SHALL implement mock authentication:
- Login page with form validation
- Registration page
- Protected routes requiring auth
- User context/state
- Logout functionality
- Persistent session (localStorage)

### Mock API

#### REQ-API1: Endpoints
The mock API SHALL provide:

```
GET    /users              # List users
POST   /users              # Register user
GET    /users/:id          # Get user

GET    /transactions       # List (supports _page, _limit, type, category, q)
POST   /transactions       # Create transaction
GET    /transactions/:id   # Get transaction
PUT    /transactions/:id   # Update transaction
DELETE /transactions/:id   # Delete transaction

GET    /categories         # List categories
POST   /categories         # Create category
PUT    /categories/:id     # Update category
DELETE /categories/:id     # Delete category

GET    /budgets            # List budget goals
POST   /budgets            # Create budget goal
PUT    /budgets/:id        # Update budget goal
DELETE /budgets/:id        # Delete budget goal
```

#### REQ-API2: Seed Data
The mock API SHALL include seed data:
- 1 demo user
- 50+ sample transactions (varied dates, types, categories)
- Default categories with icons
- Sample budget goals

#### REQ-API3: Simulated Delays
The mock API SHOULD simulate network conditions:
- Configurable response delay (300-800ms)
- Occasional simulated errors for error handling practice

---

## Out of Scope

The following are explicitly NOT included:
- Real backend/database implementation
- Real authentication (OAuth, JWT verification)
- Real payment processing
- Multi-user support
- Data export/import
- Mobile app (React Native)
- Server-side rendering (Next.js)
- Unit/integration testing (could be bonus module)
- CI/CD pipeline setup
- Production deployment configuration

---

## Glossary

| Term | Definition |
|------|------------|
| Transaction | A single income or expense record |
| Category | Classification for transactions (e.g., Food, Bills) |
| Budget Goal | Monthly spending limit for a category |
| Server State | Data from API, managed by TanStack Query |
| Client State | UI state (theme, filters), managed by Zustand |
| Optimistic Update | UI updates before API confirmation |
