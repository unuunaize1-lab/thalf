# THALF Domain & Subdomain Architecture

## Overview
THALF operates a single unified Next.js application that serves both the customer storefront and the administrative console using host-based routing.

### Production Domains
* **Customer Storefront**: `https://thalf.store`
* **Admin Portal**: `https://admin.thalf.store`

Both domains must point to the same hosting environment/deployment.

---

## Routing Architecture

Host-based routing is handled entirely within the Next.js application via `src/proxy.ts` (Next.js 16 Middleware) and `next.config.ts` rewrites.

### Proxy Behavior (`src/proxy.ts`)

| Incoming Host | Path | Action |
|---|---|---|
| `admin.thalf.store` | `/` (root) | Rewritten to `/admin/dashboard` |
| `admin.thalf.store` | `/shop`, `/cart`, `/checkout`, etc. | Redirected to `https://thalf.store/[path]` |
| `thalf.store` | `/admin/*` | Blocked (404 Not Found) - prevents info leakage |
| `www.thalf.store` | Any | 301 Redirect to canonical `https://thalf.store` |
| `localhost:3000` | Any | Allowed (Development mode) |

### Security Model
The proxy serves purely as a UX routing layer. **It is not an authorization boundary.**

All actual security is enforced server-side within the API Route Handlers (`src/app/api/v1/admin/*`) using existing RBAC guards:
* `requireSession()`
* `requireRole()`
* `requirePermission()`

---

## Authentication & Cookie Security

After security analysis, it was determined that cross-subdomain session sharing is **not** required. An administrator does not need their admin session to bleed into the customer storefront, and customers should not have their session sent to the admin subdomain.

Therefore, the session cookie (`thalf_session`) remains **Host-Only**. It intentionally does **not** use a `.thalf.store` wildcard domain attribute.

### Cookie Configuration
* **Name**: `thalf_session`
* **Domain**: (Not set - defaults to strict host-only)
* **Path**: `/`
* **HttpOnly**: `true`
* **Secure**: `true` (in production)
* **SameSite**: `Lax`

### Login Flow
1. Admin visits `admin.thalf.store/login`.
2. Logs in successfully.
3. Cookie is set strictly for `admin.thalf.store`.
4. The admin is redirected to the `/admin/orders` dashboard.
5. If the admin clicks "Exit to Store", they navigate to `thalf.store` as an unauthenticated guest.

---

## DNS & Deployment Configuration

### DNS Records Required
Assuming deployment on Vercel or a standard Node.js PaaS:

| Type | Name | Value | Purpose |
|---|---|---|---|
| A / CNAME | `@` (thalf.store) | `[Hosting Provider IP/Endpoint]` | Apex domain (Customer) |
| CNAME | `www` | `[Hosting Provider Endpoint]` | WWW redirect |
| CNAME | `admin` | `[Hosting Provider Endpoint]` | Admin Portal |

### SSL/TLS Requirements
The hosting provider must issue SSL certificates covering:
* `thalf.store`
* `www.thalf.store`
* `admin.thalf.store`
(Or a wildcard `*.thalf.store` certificate).

---

## Local Development Setup

No special configuration is required for local development.

When running on `localhost` or `127.0.0.1`, the proxy detects a non-production host and disables strict host isolation:
* The customer storefront is accessible at `http://localhost:3000`
* The admin portal is accessible at `http://localhost:3000/admin/dashboard`
* Login redirects dynamically resolve to the correct local path.
