# Green Meter - Carbon Emissions Tracking Platform

## Overview

Green Meter is a web application designed for logistics and corporate companies to measure, compare, and reduce their carbon emissions. The platform enables users to calculate their carbon footprint across multiple operational categories (vehicles, planes, heating, lighting, IT, and subcontractors), visualize baseline vs. optimized emissions scenarios, and benchmark their performance against industry peers through a leaderboard system.

**Tech Stack:**
- Frontend: React + TypeScript with Vite
- Backend: Express.js
- Database: PostgreSQL (via Neon serverless)
- ORM: Drizzle
- UI Framework: shadcn/ui (Radix UI primitives + Tailwind CSS)
- Authentication: Replit OAuth with session management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component-Based React Structure:**
- Uses React 18 with TypeScript and functional components throughout
- Route management via Wouter (lightweight routing library)
- State management through TanStack Query (React Query) for server state
- Form validation using React Hook Form with Zod resolvers

**UI Component System:**
- Based on shadcn/ui with Radix UI primitives for accessibility
- Custom Tailwind configuration with design tokens for consistent theming
- CSS variables for dynamic theming (light/dark mode support)
- Design system follows "data-focused design" principles prioritizing clarity and scannability
- Typography: Inter for text, JetBrains Mono for numerical data
- Custom spacing scale and elevation system for visual hierarchy

**Page Structure:**
- Landing: Unauthenticated marketing page
- Dashboard: Overview with KPI cards and emission visualization charts (pie/bar charts via Recharts)
- Calculator: Interactive form with category inputs and optimization sliders
- Leaderboard: Ranked table comparing company green scores
- Profile: Company profile management form

**Key Design Decisions:**
- Professional, data-centric design for corporate decision-makers
- Monospace fonts for metrics to ensure scannable alignment
- Consistent card-based layouts with shadow/border system
- Responsive design with mobile breakpoint at 768px

### Backend Architecture

**Express.js REST API:**
- ESM module structure (type: "module" in package.json)
- Middleware stack: JSON parsing, session management, request logging
- Route organization separates authentication from business logic

**API Endpoints:**
- `/api/auth/*` - Replit OAuth flow (login, logout, user info)
- `/api/calculator/calculate` - POST endpoint for emission calculations
- `/api/dashboard/latest` - GET latest emission record for authenticated user
- `/api/leaderboard` - GET ranked company performance data
- `/api/profile` - GET/POST company profile management

**Emission Calculation Logic:**
- Baseline calculations use predefined emission factors (kg CO2 per unit)
- Optimization calculations apply user-defined parameters:
  - EV adoption percentage for cars
  - Distance reduction percentage
  - Plane load factor efficiency
- Results converted from kg to tons for display
- All calculations happen server-side for consistency and security

**Session Management:**
- PostgreSQL-backed sessions via connect-pg-simple
- 7-day session TTL with HTTP-only secure cookies
- Session table integrated into database schema

### Database Architecture

**PostgreSQL via Neon Serverless:**
- WebSocket-based connection pooling for serverless environment
- Drizzle ORM for type-safe database operations
- Schema-first approach with Zod validation integration

**Database Schema:**
```
sessions: OAuth session storage (sid, sess, expire)
users: User profiles from Replit OAuth (id, email, firstName, lastName, profileImageUrl)
company_profiles: Company-specific data (companyName, sector, employees, totalDistance, loadEfficiency, renewableShare)
emission_records: Calculation history (baseline/optimized values per category, timestamps)
```

**Data Relationships:**
- One-to-one: users → company_profiles (userId foreign key with cascade delete)
- One-to-many: users → emission_records (userId foreign key with cascade delete)

**Key Design Decisions:**
- UUID primary keys for all tables
- Timestamps for created/updated tracking
- Double precision for emission values (tons CO2)
- JSON storage for session data
- Cascade deletes maintain referential integrity

### Authentication & Authorization

**Replit OAuth Integration:**
- OpenID Connect (OIDC) authentication flow
- Passport.js strategy for OAuth handling
- User profile data synced to local database on login
- Automatic token refresh mechanism

**Session Security:**
- Session secret from environment variables
- HTTP-only cookies prevent XSS attacks
- Secure flag requires HTTPS in production
- 7-day session expiration with automatic cleanup

**Authorization Pattern:**
- `isAuthenticated` middleware protects API routes
- Client-side auth check via `/api/auth/user` query
- Conditional rendering based on authentication state
- Automatic redirect to login on 401 responses

## External Dependencies

### Third-Party Services

**Neon Database:**
- Serverless PostgreSQL database
- WebSocket connections for compatibility with serverless/edge environments
- Requires `DATABASE_URL` environment variable
- Connection pooling managed via @neondatabase/serverless

**Replit OAuth:**
- OpenID Connect provider
- Requires `ISSUER_URL` (defaults to https://replit.com/oidc)
- Requires `REPL_ID` for client identification
- Requires `SESSION_SECRET` for session encryption

### Key NPM Packages

**UI & Styling:**
- @radix-ui/* - Accessible UI primitives (20+ components)
- tailwindcss - Utility-first CSS framework
- class-variance-authority - Component variant management
- recharts - Data visualization library for charts

**Data & State Management:**
- @tanstack/react-query - Server state management and caching
- drizzle-orm - TypeScript ORM for PostgreSQL
- zod - Runtime type validation
- react-hook-form - Form state management

**Authentication:**
- passport - Authentication middleware
- openid-client - OIDC client implementation
- express-session - Session middleware
- connect-pg-simple - PostgreSQL session store

**Build & Development:**
- vite - Frontend build tool and dev server
- tsx - TypeScript execution for Node.js
- esbuild - JavaScript bundler for backend
- wouter - Lightweight routing library (~1.3KB)

### Environment Variables Required

```
DATABASE_URL - PostgreSQL connection string
REPL_ID - Replit application identifier
ISSUER_URL - OIDC provider URL (optional, defaults to Replit)
SESSION_SECRET - Session encryption key
NODE_ENV - Environment flag (development/production)
```

### Build & Deployment

**Development:**
- Vite dev server for frontend with HMR
- tsx for hot-reloading TypeScript backend
- Concurrent client/server development via single process

**Production:**
- Vite builds frontend to dist/public
- esbuild bundles backend to dist/index.js
- Static file serving from Express
- ESM output for Node.js execution

**Database Migrations:**
- Drizzle Kit manages schema migrations
- `db:push` command for schema synchronization
- Migration files stored in /migrations directory