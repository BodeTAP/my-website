# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# Active Skills

@~/.claude/skills/engineering-team/senior-fullstack/SKILL.md
@~/.claude/skills/engineering-team/senior-frontend/SKILL.md
@~/.claude/skills/engineering-team/senior-backend/SKILL.md
@~/.claude/skills/engineering-team/code-reviewer/SKILL.md
@~/.claude/skills/engineering/focused-fix/SKILL.md
@~/.claude/skills/engineering/api-design-reviewer/SKILL.md
@~/.claude/skills/engineering/performance-profiler/SKILL.md
@~/.claude/skills/engineering/skill-security-auditor/SKILL.md

---

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build + sitemap (postbuild runs next-sitemap)
npm run lint         # ESLint check
npx prisma migrate dev        # Run DB migrations
npx prisma db seed            # Seed database (uses prisma/seed.ts via tsx)
npx prisma studio             # Open Prisma Studio GUI
npx prisma generate           # Regenerate Prisma client
```

---

## Architecture

This is a full-stack Next.js agency SaaS ("MFWEB") with three distinct user-facing zones:

- **Public marketing site** — blog, portfolio, pricing calculator, service pages, tools
- **Admin dashboard** — CMS, leads, invoices, proposals, projects, clients
- **Client portal** — project tracking, invoices with PDF download, support tickets

### Route Groups

```
app/
  (public)/          # Public marketing pages — no auth required
  admin/
    login/           # Public login
    (protected)/     # Requires ADMIN role (enforced in proxy.ts middleware)
  portal/
    login|register|reset-password/  # Public auth flows
    (protected)/     # Requires any authenticated session
  onboarding/[token]/  # Token-based forms — fully public
  api/               # API routes (see below)
```

### Middleware / Auth Guard

`proxy.ts` (re-exported from `middleware.ts`) guards `/admin/*` and `/portal/*`. It reads the NextAuth v5 JWT using `getToken()` with the exact cookie name as salt — this is intentional and required for NextAuth v5 compatibility. Do not change the `cookieName`/`salt` symmetry.

- Admin routes → redirect to `/admin/login` unless `token.role === "ADMIN"`
- Portal routes → redirect to `/portal/login` unless any valid token exists

### Auth Stack

`lib/auth.ts` — NextAuth v5 (beta) with three providers:
- **Credentials** — email + bcryptjs password hash
- **Google OAuth** — for admin Google sign-in
- **Resend** — magic-link email (via `AUTH_RESEND_KEY`)

`lib/auth.config.ts` — edge-compatible base config imported by middleware.

### Database

Prisma + PostgreSQL via `@prisma/adapter-pg`. Singleton client in `lib/prisma.ts`.

Core model groups:
- **Auth**: `User`, `Account`, `Session`, `VerificationToken`
- **Content**: `Article`, `Category`, `Portfolio`, `Testimonial`, `SiteSetting`
- **Business**: `Lead`, `Proposal`, `Client`, `Project`, `Invoice`, `Subscription`, `MaintenancePackage`
- **Support**: `Ticket`, `TicketMessage`, `Notification`

Role enum: `ADMIN` | `CLIENT`. Status enums live on each model (see `prisma/schema.prisma`).

### Key Libraries

| File | Purpose |
|------|---------|
| `lib/email.ts` | Resend transactional email templates for all notification types |
| `lib/tripay.ts` | Tripay payment gateway integration + sandbox mode via `TRIPAY_SANDBOX` env |
| `lib/whatsapp.ts` | WhatsApp API integration |
| `lib/notifications.ts` | Helper to create `Notification` records in DB |
| `lib/rateLimit.ts` | Rate limiting utility for public API routes |
| `lib/utils.ts` | `cn()` — Tailwind class merging (clsx + tailwind-merge) |

### API Routes

```
/api/auth/[...nextauth]      # NextAuth handlers
/api/admin/*                 # Protected admin CRUD endpoints
/api/portal/*                # Protected client endpoints
/api/contact                 # Public contact form
/api/upload                  # Vercel Blob file upload
/api/tools/*                 # PageSpeed, SEO check (public)
/api/pay/[invoiceNo]         # Payment initiation (public)
/api/webhooks/tripay         # Tripay payment webhook
/api/cron/publish-scheduled  # Scheduled article publishing
```

### Payment Flow

Tripay is the payment gateway. A Cloudflare Worker (`cloudflare-worker/`) acts as a proxy to avoid IP whitelist issues. Set `TRIPAY_SANDBOX=true` to use Tripay sandbox mode. Webhook endpoint: `/api/webhooks/tripay`.

### File Storage

Vercel Blob (`@vercel/blob`) for all uploaded images. `next.config.ts` whitelists `blob.vercel-storage.com` as a remote image pattern.

### UI Stack

- **Tailwind CSS v4** — config via PostCSS (`postcss.config.mjs`), no separate `tailwind.config.*`
- **shadcn/ui** — components in `components/ui/` (base-nova style, `@/components/ui` alias)
- **Tiptap** — rich text editor used in the admin article editor
- **Framer Motion** — animations on public pages

### Environment Variables (required)

```
DATABASE_URL            # PostgreSQL connection string
AUTH_SECRET             # NextAuth JWT encryption key
NEXT_PUBLIC_SITE_URL    # Public base URL
GOOGLE_CLIENT_ID        # Google OAuth
GOOGLE_CLIENT_SECRET    # Google OAuth
AUTH_RESEND_KEY         # Resend API key for magic links
EMAIL_FROM              # Sender address for transactional emails
TRIPAY_API_KEY          # Tripay private key
TRIPAY_MERCHANT_CODE    # Tripay merchant code
TRIPAY_SANDBOX          # "true" for sandbox mode
BLOB_READ_WRITE_TOKEN   # Vercel Blob token
```
