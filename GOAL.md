# Project Goals

This repository is a **learn-by-doing React tutorial** that teaches React 19 development through building a real-world personal finance tracker application.

## Core Philosophy

### 1. Learn by Doing, Not by Reading
- Tutorial exercises guide learners through implementation without giving answers upfront
- Each section presents a challenge, hints, and verification steps
- Solutions are available but intentionally separate from the learning path
- Encourages experimentation and debugging as part of the learning process

### 2. Beginner Friendly, Industry Ready
- Assumes basic JavaScript/HTML/CSS knowledge, no prior React experience required
- Starts from fundamentals and progressively introduces advanced concepts
- Uses the same patterns, tools, and practices found in production codebases
- Avoids "toy examples" - every feature serves the actual application

### 3. Complete Backend Simulation
- Mock API (`json-server`) provides realistic backend behavior
- Supports authentication, CRUD operations, pagination, filtering, and search
- Simulates network latency and error conditions
- Allows learners to focus on React without backend distractions

## Learning Objectives

### Fundamentals
- [x] JSX syntax and component composition (Module 02)
- [x] Props, state, and the unidirectional data flow (Module 02, 03)
- [x] Event handling and controlled components (Module 02, 03, 06)
- [x] Conditional rendering and lists (Module 02)
- [x] useEffect and the component lifecycle (Module 03)

### Intermediate Concepts
- [x] Custom hooks and logic reuse (Module 04)
- [x] Context API for shared state (Module 04, with Zustand recommended for complex state)
- [x] Form handling with validation (React Hook Form + Zod) (Module 06)
- [x] Routing with React Router (Module 05)
- [x] Error boundaries and error handling patterns (Module 12)

### Advanced Patterns
- [x] Server state management (TanStack Query) (Modules 07, 08)
- [x] Client state management (Zustand) (Module 09)
- [x] Optimistic updates and cache invalidation (Module 08)
- [x] Code splitting and lazy loading (Module 12)
- [x] Performance optimization (memo, useMemo, useCallback) (Module 04, 12)

### Industry Practices
- [x] TypeScript integration from day one (All modules)
- [x] Project structure and organization (Module 00, 01)
- [x] API layer abstraction patterns (Module 07)
- [x] Authentication flow implementation (Module 11)
- [x] Environment configuration (Module 01, 12)

## Additional Goals

### Developer Experience
- Modern tooling setup (Vite, ESLint, TypeScript)
- Hot module replacement for rapid iteration
- Clear error messages and debugging guidance
- Consistent code style and conventions

### Real-World Readiness
- Responsive design considerations
- Accessibility basics (semantic HTML, ARIA where needed)
- Loading and error states for all async operations
- Form validation with user-friendly error messages

### Tricky Parts & Tips
Each module should highlight:
- Common pitfalls and how to avoid them
- Performance gotchas (unnecessary re-renders, stale closures)
- When to use which state management approach
- Debugging techniques and React DevTools usage

## Non-Goals

To keep the tutorial focused, we intentionally exclude:
- Backend/Node.js development (mock API is pre-built)
- CSS frameworks deep-dives (styling is provided)
- Deployment and DevOps
- Mobile development (React Native)
- Server-side rendering (Next.js/Remix)

## Success Criteria

A learner who completes this tutorial should be able to:
1. Build a React application from scratch with confidence
2. Read and understand production React codebases
3. Make informed decisions about state management
4. Debug common React issues independently
5. Continue learning advanced topics with a solid foundation
