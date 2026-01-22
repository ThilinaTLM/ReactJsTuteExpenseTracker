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
- [ ] JSX syntax and component composition
- [ ] Props, state, and the unidirectional data flow
- [ ] Event handling and controlled components
- [ ] Conditional rendering and lists
- [ ] useEffect and the component lifecycle

### Intermediate Concepts
- [ ] Custom hooks and logic reuse
- [ ] Context API for shared state
- [ ] Form handling with validation (React Hook Form + Zod)
- [ ] Routing with React Router
- [ ] Error boundaries and error handling patterns

### Advanced Patterns
- [ ] Server state management (TanStack Query)
- [ ] Client state management (Zustand)
- [ ] Optimistic updates and cache invalidation
- [ ] Code splitting and lazy loading
- [ ] Performance optimization (memo, useMemo, useCallback)

### Industry Practices
- [ ] TypeScript integration from day one
- [ ] Project structure and organization
- [ ] API layer abstraction patterns
- [ ] Authentication flow implementation
- [ ] Environment configuration

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
