# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## Common Commands

```bash
npm run dev               # Start development server (localhost:3000)
npm run build             # Production build (auto-generates sitemap)
npm run lint              # Run ESLint with flat config
npm run test              # Vitest watch mode for tests
npm run test:run          # Run all tests once (no watch)
npx tsc --noEmit          # TypeScript type check
npx prisma migrate dev    # Create and apply DB migrations
npx prisma generate       # Regenerate Prisma client (auto-runs on install)
npx prisma db seed        # Seed database (includes initial admin & permissions)
npx prisma studio         # Open Prisma GUI for database inspection
```

## Architecture Overview

This is a full-stack Next.js 16 agency SaaS with three distinct zones: public marketing site, admin dashboard (RBAC-protected), and client portal. The app uses bleeding-edge versions of Next.js 16, React 19, NextAuth v5, Prisma v7, and Tailwind CSS v4.

### Route Groups & Access Control

```
app/
  (public)/          # Marketing site — blog, portfolio, public tools (no auth)
  admin/
    login/           # Public admin login page
    (protected)/     # All admin routes require ADMIN role via proxy.ts
  portal/
    login|register|reset-password/  # Public client auth flows
    (protected)/     # Client dashboard — requires any authenticated user
  onboarding/[token]/ # Public token-based forms
  api/
    admin/*          # Protected admin CRUD + AI endpoints (RBAC enforced)
    portal/*         # Protected client endpoints
    webhooks/tripay  # Public payment webhook (HMAC-verified)
```

### Authentication & Middleware

The `proxy.ts` middleware (re-exported from `middleware.ts`) guards all `/admin/*` and `/portal/*` routes:

- Uses NextAuth v5 `getToken()` with cookie name as both cookieName AND salt — this symmetry is required for v5. Do not change this.
- Admin routes redirect to `/admin/login` unless `token.role === "ADMIN"`.
- Portal routes redirect to `/portal/login` for unauthenticated users.
- `/api/admin/*` routes return 401 for non-admin users.

### Role-Based Access Control (RBAC)

Permissions are always validated from the database, not from the JWT. This ensures immediate permission changes without requiring admin re-login:

- **Super Admin**: Can manage team roles and permissions. First admin (by createdAt) is auto-designated as Super Admin if no explicit super admin exists.
- **Regular Admins**: Access only modules assigned via their role.
- **15 Permission Modules**: articles, leads, broadcast, clients, projects, invoices, proposals, tickets, portfolio, testimonials, hosting, maintenance, ai_settings, analytics, team.

Key RBAC functions in `lib/permissions.ts`:
- `isSuperAdmin(adminId)` — Check if user is super admin
- `checkPermission(adminId, module)` — Check module access
- `requireModule(module)` — Page guard (redirects to /admin?denied=1)
- `requireApiPermission(module)` — API guard (returns 403 NextResponse)
- `getAdminModules(adminId)` — Get allowed modules for adaptive sidebar

### Database Models

Prisma v7 with PostgreSQL. Key model groups:

- **Auth**: `User` (roles: ADMIN | CLIENT), `Account`, `Session`, `VerificationToken`
- **RBAC**: `TeamRole`, `TeamRolePermission`, `AdminPermission`, `PermissionAuditLog`
- **Content**: `Article` (draft/publish/scheduled), `Category`, `Portfolio`, `Testimonial`, `SiteSetting`
- **CRM**: `Lead` (with lead finder integration), `Proposal`
- **Business**: `Client`, `Project`, `Invoice` (with Tripay payment), `Subscription`, `MaintenancePackage`
- **Support**: `Ticket`, `TicketMessage`, `Notification`
- **Hosting**: `HostingRecord` (domain/hosting/SSL expiry tracking)
- **Broadcast**: `BroadcastLog` (WhatsApp broadcast statistics)

### WhatsApp Broadcasting System

Advanced anti-spam system in `lib/whatsapp.ts` with 9-layer humanization:

- Synonym replacement (13 keyword groups, 4 variants each)
- Rotating emoji bullets (10 variants)
- Time-based greeting variations + 6 casual openings
- Personalized hooks (30% questions, 70% statistics)
- Category-specific contexts (8 business types)
- CTA variations (8 variants + no CTA)
- Footer variations (5 variants + no footer)
- Punctuation humanization
- Zero-width character fingerprinting

Additional features:
- Non-linear delays with bell-curve distribution + burst pause every 5 messages
- Device rotation per batch for multi-device setups
- 24-hour cooldown per lead, 50 messages/day rate limit per admin
- Full broadcast logging with statistics

### AI Integration

Anthropic Claude integration via `lib/ai.ts`:
- Default model: `claude-haiku-4-5-20251001` (configurable via `lib/aiSettings.ts`)
- Admin AI endpoints: draft-article, cover-image (Pexels → Vercel Blob), seo-analyze, suggest-topics, draft-reply
- Client portal: streaming AI help widget (`components/portal/AIHelpWidget.tsx`)
- Lead Finder: Google Places API integration to find businesses without websites

### Payment Flow

Tripay payment gateway with Cloudflare Worker proxy:
- Proxy route: `cloudflare-worker/` (bypasses IP whitelist restrictions)
- Webhook: `/api/webhooks/tripay` (public, HMAC-verified)
- Sandbox mode: Set `TRIPAY_SANDBOX=true` in environment
- Payment page: `/bayar/[invoiceNo]`

### Key Libraries

| File | Purpose |
|------|---------|
| `lib/auth.ts` | NextAuth v5 config (Credentials, Google OAuth, Resend magic-link) |
| `lib/auth.config.ts` | Edge-compatible base config (imported by middleware) |
| `lib/prisma.ts` | Prisma singleton client |
| `lib/ai.ts` | Anthropic Claude SDK + Pexels cover image generation |
| `lib/whatsapp.ts` | WA broadcasting with anti-spam engine |
| `lib/tripay.ts` | Tripay gateway integration |
| `lib/rateLimit.ts` | Upstash Redis rate limiting for public routes |
| `lib/permissions.ts` | RBAC permission service (DB-backed) |
| `lib/audit.ts` | Audit logging for permission changes |
| `lib/email.ts` | Resend transactional emails |
| `lib/notifications.ts` | In-app notification creation |
| `lib/utils.ts` | `cn()` — clsx + tailwind-merge |

## Important Quirks

- **No `tailwind.config.*`**: Tailwind v4 is configured via PostCSS (`postcss.config.mjs`) and CSS variables in `app/globals.css`
- **`postinstall` hook**: Auto-runs `prisma generate` — Prisma client is always regenerated after npm install
- **`postbuild` hook**: Auto-runs `next-sitemap` — sitemap/robots.txt generated from `next-sitemap.config.js`
- **No Prettier**: Do not add `.prettierrc` or run prettier
- **Sentry tunneling**: Configured in `next.config.ts` via `withSentryConfig`, reports sent through `/monitoring` route
- **CI pipeline**: Runs lint → typecheck → build (sequential). Tests are NOT run in CI.
- **Environment**: `.env` file is committed with real credentials. No `.env.example` exists.

## Required Environment Variables

```
DATABASE_URL              # PostgreSQL connection string
AUTH_SECRET               # NextAuth JWT encryption key
NEXT_PUBLIC_SITE_URL      # Public base URL
GOOGLE_CLIENT_ID          # Google OAuth
GOOGLE_CLIENT_SECRET      # Google OAuth
AUTH_RESEND_KEY           # Resend API for magic links & emails
EMAIL_FROM                # Sender address for transactional emails
TRIPAY_API_KEY            # Tripay private key
TRIPAY_MERCHANT_CODE      # Tripay merchant code
TRIPAY_SANDBOX            # "true" for sandbox mode
BLOB_READ_WRITE_TOKEN     # Vercel Blob storage
ANTHROPIC_API_KEY         # Claude API key
PEXELS_API_KEY            # Pexels image search (cover images)
NEXT_PUBLIC_SENTRY_DSN    # Sentry error tracking
```

Additional optional config managed from `/admin/settings`: Facebook Pixel ID, Google Analytics ID, Fonnte API keys (single/multi-device), AI model selection (Haiku/Sonnet).
