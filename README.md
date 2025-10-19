# HR Monitoring and Evaluation System

## Project Overview

A Web-Based Monitoring and Evaluation System for the Department of Human Resources Management at the Ministry of Local Government and Public Works (Zimbabwe). This system centralizes HR data management, performance tracking, recruitment monitoring, and training evaluation.

## Tech Stack

### Frontend (Client)

- **Framework**: React 19 + TypeScript
# HR Monitoring and Evaluation System

This repository contains a full-stack Human Resources Monitoring & Evaluation application used by the Department of Human Resources Management. The system centralizes employee records, performance evaluations, recruitment, training, calendar events, and reporting.

This README documents the architecture, code components, how the system works, basic user documentation, and a data-flow diagram (Mermaid) you can render on GitHub or locally.

## Table of contents

- Project overview
- Architecture and components
- How it works (request/response flows)
- User documentation (what users see and how to act)
- Data flows (Mermaid diagram + explanation)
- Developer tasks: local setup and debugging tips
- API reference (summary)

---

## Project overview

This app is a React + TypeScript frontend and Express + TypeScript backend. The backend uses MySQL for persistent storage and stored procedures for core CRUD and reporting functionality. Firebase provides authentication (ID tokens) which the backend verifies.

Key goals:
- Centralized HR data and analytics
- Role-based access (admin, hr, employee)
- Calendar-driven event management (interviews, training, meetings)
- Report generation (JSON / CSV / XLSX / PDF)

## Architecture and components

Top-level folders:

- `client/` — React frontend (Vite)
   - `src/components/` — Shared UI components (ProtectedRoute, Layout, Modals)
   - `src/pages/` — Page screens (Auth, Dashboard, Calendar, Reports, AdminUsers, etc.)
   - `src/contexts/AuthContext.tsx` — Firebase sign-in + session management and merge of DB role
   - `src/api.ts` — Axios API client configured with BASE_URL and request/response interceptors

- `server/` — Express backend
   - `src/config/*` — DB and Firebase admin configuration
   - `src/controllers/*` — Handlers for calendar, reports, auth, admin, employees
   - `src/middleware/*` — Authentication & role-based authorization middlewares
   - `src/routes/*` — Routes wiring
   - `server/sequelize.sql` — schema with tables, views and stored procedures

## How it works (key flows)

1) User sign-in/registration
- The user signs in via Firebase (client). The client gets an ID token from Firebase and stores a user object (`sessionStorage.user`) with the token.
- The client calls server endpoints using `src/api.ts` (axios) which attaches the token to Authorization header.
- Server middleware validates the ID token via Firebase Admin SDK and then queries the database (stored procedure `sp_get_user_role`) to obtain the authoritative role for that user.

2) Role enforcement & ProtectedRoute (client)
- The client `ProtectedRoute` first checks `sessionStorage.user.role` and if missing calls `GET /api/auth/me` (via the axios helper). The returned DB role is normalized, stored back into `sessionStorage.user.role`, and used to decide access.
- If the role is not `admin` or `hr`, `ProtectedRoute` places an `authMessage` into sessionStorage and redirects the user to `/auth` where the message is shown. This prevents unauthorized access to the dashboard UI.

3) Calendar/events
- Client fetches calendar events via `GET /api/calendar/events?from=YYYY-MM-DD&to=YYYY-MM-DD`.
- Create/Update/Delete operations are routed to the server which calls stored procedures (e.g., `sp_create_calendar_event`) to persist changes.

4) Reports
- Client requests a report generation endpoint. The server prepares JSON/CSV/XLSX/PDF and can optionally save files under `public/reports` and return an absolute URL.

## User documentation (quick start)

For normal staff (employees):

- Sign in on `/auth` with your department credentials (or via Google if enabled).
- If your account is newly registered, an administrator must approve you. You will see a pending message on the sign-in page.
- Once approved (role = `hr` or `admin`), you can access the Dashboard, Calendar and other pages per your role.

For HR staff:

- Access the Dashboard to view stats and upcoming interviews/training.
- Use the Calendar page to create/edit events (interviews, training sessions). Events map to stored procedures on the server and persist to the database.
- Generate reports from the Reports page (choose format and optionally save files).

For Admins:

- Appoint HR users through the AdminUsers page.
- Manage departments, employees and higher-level reports.

## Data flow (Mermaid diagram)

Below is a simplified data-flow diagram. Renderable by GitHub (Mermaid support) or tools that support Mermaid diagrams.

```mermaid
flowchart TD
   subgraph Client
      A[Browser / React App]
      A -->|Sign-in via Firebase| B[Firebase Auth]
      A -->|API requests (axios)| API[API Client]
   end

   subgraph Server
      API --> M[Express Middleware]
      M -->|Validate Firebase token| B
      M -->|Get role via sp_get_user_role| DB[(MySQL)]
      M --> Controllers[Controllers]
      Controllers --> DB
      Controllers --> Files[public/reports]
   end

   subgraph DB
      DB[(MySQL + Stored Procedures)]
   end

   B -->|Authoritative ID| Server
   Files -->|Saved report URL| A

   classDef infra fill:#f7f7f9,stroke:#333,stroke-width:1px;
   class DB,Files infra;
```

Explanation:
- The client authenticates with Firebase and receives an ID token. The Axios client attaches this token to every API request.
- Server middleware validates the token, then queries the database for an authoritative role (stored procedure). Controllers handle business logic and call stored procedures to read/write data.
- If reports are saved, the server writes files to `public/reports` and returns full URLs to the client.

## Developer setup & debugging tips

1) Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

2) Start both services (local dev)

```bash
# Start the backend (in server/)
npm run dev # or node ./dist/index.js depending on how you run it

# Start the frontend (in client/)
npm run dev
```

3) Vite dev proxy (recommended)

If you prefer to use relative `/api/*` paths from the browser, add a proxy entry to `vite.config.ts`:

```ts
// vite.config.ts
export default defineConfig({
   // ...existing config
   server: {
      proxy: {
         '/api': 'http://localhost:3800'
      }
   }
})
```

4) Troubleshooting `/api/auth/me` returning HTML

- If you see HTML (Vite index.html) when calling `/api/auth/me`, it means dev server is handling the route. Fix by:
   - Ensuring the backend is running and reachable at the base URL defined in `client/src/api.ts` (default: http://localhost:3800)
   - Adding the Vite proxy above during development
   - Ensuring the server returns JSON error objects (not HTML) on failure

## API Quick Reference

- `GET /api/auth/me` — Return { success: true, data: { uid, email, role } }
- `GET /api/calendar/events?from=&to=&employee_id=&event_types=` — Returns calendar events
- `POST /api/calendar/events` — Create event (calls stored proc)
- `PUT /api/calendar/events/:id` — Update event
- `DELETE /api/calendar/events/:id` — Delete event
- `GET /api/reports/:reportName?format=pdf&save=1` — Generate report

## Notes & next tasks

- The DB is the source of truth for roles. The client merges the DB role into session storage immediately after sign-in and on ProtectedRoute checks.
- Consider adding server-side logging around stored procedure calls if you see inconsistent data or errors.
- Improve accessibility and lint warnings in the client (labels, button text, inline styles flagged by linter).

---

If you'd like, I can also:
- Add the Vite proxy automatically and run a quick smoke test of `/api/auth/me` from this environment, or
- Generate a PNG of the Mermaid diagram and add it to the repository, or
- Produce a short CONTRIBUTING.md with developer scripts for running both services in development.

If you want any of those, tell me which and I'll implement it next.
