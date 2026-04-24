# LogiScout — AI-Powered Incident Resolution

> Intelligent log management and incident monitoring for DevOps and SRE teams.

LogiScout streams, indexes, and analyzes your application logs in real time. Get AI-powered root cause detection, instant alerts, and actionable insights for your Node.js & Python services — all from a single dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Development Server](#running-the-development-server)
- [Application Routes](#application-routes)
- [Authentication](#authentication)
- [Dashboard Modules](#dashboard-modules)
- [Integrations](#integrations)
- [Pricing Plans](#pricing-plans)
- [Architecture Decisions](#architecture-decisions)
- [Scripts](#scripts)
- [Contributing](#contributing)

---

## Overview

LogiScout is a production-grade observability platform frontend built with **Next.js 16** and **React 19**. It provides DevOps and SRE teams with a unified interface to:

- Ingest and visualize logs from Python and Node.js services
- Detect anomalies and run AI-powered root cause analysis
- Manage incidents collaboratively with SLA tracking
- Generate analytics reports with latency percentiles, error rates, and service health scores
- Integrate with Slack, PagerDuty, GitHub, and cloud providers (AWS / GCP)

---

## Features

| Feature | Description |
|---|---|
| **Real-Time Log Streaming** | Ingest and tail logs with sub-second latency. Filter by service, log level, and request ID. |
| **AI Root Cause Analysis** | Automatically correlate cross-service anomalies and surface the root cause before user impact. |
| **Smart Alerting** | Threshold-based and anomaly-based alerts delivered via Slack, webhooks, PagerDuty, or email. |
| **Incident Management** | Create, assign, and track incidents to resolution. Built-in post-mortems and SLA tracking. |
| **Analytics & Dashboards** | Customizable charts for error rates, MTTR trends, severity distributions, and service health. |
| **Developer-First SDKs** | One-line integration for Python (`logiscout`) and Node.js (`@logiscout/logger`). |
| **Project & Token Management** | Create isolated projects per service and manage scoped API tokens with full lifecycle control. |
| **OAuth Support** | Sign in with Google or GitHub in addition to email/password + OTP. |
| **Dark / Light Mode** | System-aware theming with manual override via `next-themes`. |

---

## Tech Stack

### Core

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Runtime | React 19 |
| Styling | Tailwind CSS |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives) |
| State Management | Redux Toolkit + React-Redux |
| HTTP Client | Axios (cookie-based auth, interceptors) |
| Forms | React Hook Form + `@hookform/resolvers` |
| Charts | Recharts |
| Theming | next-themes |
| Analytics | Vercel Analytics |
| Package Manager | pnpm |

### UI Component Library

- **Radix UI** primitives for accessible headless components (accordion, dialog, dropdown, popover, etc.)
- **Lucide React** for icons
- **class-variance-authority** + `clsx` for conditional variant styling
- **Embla Carousel**, `cmdk`, `input-otp`, `react-day-picker` for specialized inputs

---

## Project Structure

```
logiscout-frontend/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (Redux provider, ThemeProvider, Analytics)
│   ├── page.tsx                  # Landing page (redirects to /dashboard if authenticated)
│   ├── auth/
│   │   ├── callback/page.tsx     # OAuth callback handler
│   │   ├── login/page.tsx        # Sign-in page
│   │   └── signup/page.tsx       # Sign-up page
│   ├── dashboard/page.tsx        # Protected dashboard (multi-view)
│   ├── logs/page.tsx             # Dedicated live logs view
│   └── verify-otp/page.tsx       # OTP verification step
│
├── components/
│   ├── auth/                     # Auth UI components
│   │   ├── sign-in.tsx           # Email/password + OAuth sign-in form
│   │   ├── sign-up.tsx           # Registration form
│   │   ├── verify-otp.tsx        # 6-digit OTP input
│   │   ├── oauth-callback.tsx    # Handles OAuth redirect & token exchange
│   │   └── protected-route.tsx   # Route guard (redirects unauthenticated users)
│   │
│   ├── dashboard/                # Dashboard feature components
│   │   ├── dashboard-layout.tsx  # Shell with sidebar navigation
│   │   ├── dashboard-overview.tsx# Stats cards, recent incidents, system health
│   │   ├── live-logs.tsx         # Real-time log stream with filtering & auto-scroll
│   │   ├── analytics-dashboard.tsx# Recharts-powered incident and performance charts
│   │   ├── project-selector.tsx  # Project list + creation wizard
│   │   ├── token-management.tsx  # API token lifecycle (create, view, revoke)
│   │   └── documentation.tsx     # Embedded SDK integration docs
│   │
│   ├── landing/                  # Marketing landing page sections
│   │   ├── navbar.tsx
│   │   ├── hero.tsx              # Animated hero with live log preview terminal
│   │   ├── stats.tsx
│   │   ├── features.tsx          # Feature grid (6 cards)
│   │   ├── how-it-works.tsx      # 3-step install → connect → monitor
│   │   ├── integrations.tsx      # Integration tiles (Node.js, Python, GitHub, Slack…)
│   │   ├── pricing.tsx           # Starter / Pro / Enterprise plan cards
│   │   ├── testimonials.tsx
│   │   ├── cta.tsx
│   │   └── footer.tsx
│   │
│   ├── shared/
│   │   └── theme-provider.tsx    # next-themes wrapper
│   │
│   └── ui/                       # shadcn/ui component library (50+ primitives)
│
├── lib/
│   ├── api.ts                    # Axios instance, all API methods, TypeScript interfaces
│   ├── logger.ts                 # Lightweight structured logger (SSR + browser compatible)
│   ├── utils.ts                  # Tailwind `cn()` helper
│   └── store/
│       ├── store.ts              # Redux store configuration
│       ├── authSlice.ts          # Auth state, async thunks (session, signIn, signUp, OAuth)
│       ├── hooks.ts              # Typed `useAppDispatch` / `useAppSelector`
│       └── provider.tsx          # Redux `<Provider>` wrapper component
│
├── hooks/
│   ├── use-toast.ts              # Toast notification hook
│   └── use-mobile.ts             # Responsive breakpoint hook
│
├── styles/
│   └── globals.css               # Tailwind base + CSS custom properties
│
├── public/                       # Static assets (icons, images)
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
└── components.json               # shadcn/ui configuration
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 9 — install via `npm install -g pnpm`
- A running **LogiScout backend** instance (see `NEXT_PUBLIC_API_URL` below)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd logiscout-frontend

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Backend API base URL (defaults to http://localhost:8000 if not set)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> **Security note:** Auth tokens are stored in **httpOnly cookies** managed by the backend. The frontend never stores raw tokens in `localStorage` or JavaScript-accessible cookies.

### Running the Development Server

```bash
pnpm dev
```

Open [http://localhost:4001](http://localhost:4001) in your browser.

---

## Application Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page — auto-redirects to `/dashboard` if authenticated |
| `/auth/signup` | Public | User registration with OTP email verification |
| `/auth/login` | Public | Email/password and OAuth sign-in |
| `/auth/callback` | Public | OAuth redirect callback (Google / GitHub) |
| `/verify-otp` | Public | 6-digit OTP input to complete signup |
| `/dashboard` | Protected | Main application — projects, logs, analytics, docs, tokens |
| `/logs` | Protected | Dedicated full-screen live log viewer |

---

## Authentication

LogiScout supports three authentication methods:

### 1. Email + Password (with OTP)

1. User submits registration form → backend sends a 6-digit OTP to their email
2. User enters OTP at `/verify-otp` → session cookie is set
3. Subsequent visits call `/api/auth/me` to verify the session cookie

### 2. Google OAuth

1. Frontend fetches the Google redirect URL from `/api/auth/google`
2. User is redirected to Google, then returns to `/auth/callback`
3. Backend exchanges the code for tokens and sets the session cookie

### 3. GitHub OAuth

Same flow as Google, using `/api/auth/github`.

### Session Management

- Sessions are validated on every app load via `checkSession` in the Redux `authSlice`
- User data is cached in `localStorage` for instant UI rendering and verified against the live session
- On `401` responses, the Axios interceptor clears the session and redirects to `/`

---

## Dashboard Modules

Once authenticated and a project is selected, the sidebar provides access to:

### Overview
- Key metrics: total logs ingested, active incidents, incidents resolved today, average resolution time
- Logs breakdown by level (info, warning, error, critical)
- Recent incidents table with severity and status
- System health grid (API server, database, cache, queue)

### Live Logs
- Real-time log stream with auto-scroll and pause/resume controls
- Filter by **log level** (all / error / warning / info / success) and **service**
- Download log snapshot as a file
- Per-entry metadata (request ID, user ID)

### Analytics
- **Incident trend chart** — critical / high / medium / low over time (Recharts `AreaChart`)
- **MTTR trend** — mean time to resolution improving week-over-week
- **Severity distribution** — `PieChart` breakdown
- **Resolution rate** — weekly resolved vs. total
- **Service health scorecards** — uptime % and incident count per service
- **Response time percentiles** — p50 / p95 / p99 over 24 hours

### Project Selector
- Lists all projects owned by the authenticated user
- Create new project wizard: name & description → language selection (Python / Node.js) → auto-generated API token with copy UI
- Inline SDK quickstart shown immediately after project creation

### Token Management
- View all API tokens for the selected project
- Create new tokens with a custom label
- Reveal / hide token value securely
- Disable (revoke) tokens with confirmation dialog

### Documentation
- Embedded interactive SDK reference
- Python and Node.js code examples with syntax highlighting and copy-to-clipboard
- Covers installation, basic usage, structured logging, log levels, and webhook configuration

---

## Integrations

| Integration | Type | Usage |
|---|---|---|
| **Node.js** | Official SDK | `npm install @logiscout/logger` |
| **Python** | Official SDK | `pip install logiscout` |
| **GitHub** | OAuth + Deployments | Deployment correlation in log stream |
| **Slack** | Alerts | Receive incident notifications in Slack channels |
| **Webhooks** | Custom | POST alert payloads to any endpoint |
| **AWS / GCP** | Cloud Logs | Route CloudWatch / Stackdriver logs to LogiScout |

---

## Pricing Plans

| Plan | Price | Key Limits |
|---|---|---|
| **Starter** | Free | 1 project, 500 MB/day, 7-day retention, 2 members |
| **Pro** | $49 / mo | Unlimited projects, 10 GB/day, 30-day retention, 10 members, AI RCA, custom dashboards |
| **Enterprise** | Custom | Unlimited everything, custom retention, SSO/SAML, on-prem option, SLA guarantees |

---

## Architecture Decisions

### Cookie-Based Authentication
Auth tokens are stored exclusively in **httpOnly cookies** (set and managed by the backend). This prevents XSS attacks from accessing tokens via JavaScript.

### Redux for Auth State
Global auth state (user profile, `isAuthenticated`, loading/error flags) lives in Redux Toolkit to avoid prop drilling across deeply nested routes and to support the `ProtectedRoute` guard pattern.

### Lightweight Frontend Logger
A custom zero-dependency structured logger (`lib/logger.ts`) is used instead of a Node.js-specific library to ensure compatibility with both SSR and browser environments. It outputs timestamped, namespaced log lines and is silenced above `debug` level in production.

### Component Co-location
Feature components live close to the routes they serve (`components/dashboard/`, `components/landing/`). Only genuinely reusable primitives go in `components/ui/`.

### shadcn/ui (Copy-Owned Components)
UI primitives are owned in the repository (`components/ui/`) rather than installed as a black-box library. This makes it easy to customize theme tokens, fix accessibility issues, or add variants without forking a dependency.

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the Next.js development server with hot reload |
| `pnpm build` | Compile and optimize for production |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint across the entire project |

---

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feat/your-feature`
2. Follow the existing code style — TypeScript strict mode, named exports, `createLogger` for any logging
3. Keep components focused — one concern per file
4. Use the `cn()` utility from `lib/utils.ts` for conditional Tailwind classes
5. Open a pull request with a clear description of the change and its motivation

---

> Built with Next.js · Deployed on Vercel · SOC 2 compliant
