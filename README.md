# MFWEB

Platform SaaS full-stack untuk digital agency — mengelola leads, klien, proyek, invoice, dan konten dari satu dashboard.

## Fitur

- **Public site** — blog, portfolio, kalkulator harga, tools SEO & PageSpeed
- **Admin dashboard** — CMS artikel, manajemen leads/klien/proyek/invoice, proposal builder
- **Client portal** — tracking proyek, download invoice PDF, tiket support dengan AI assistant
- **AI features** — draft artikel, analisis SEO, generate cover image, saran topik (Claude API)
- **Payment** — integrasi Tripay dengan Cloudflare Worker proxy

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Database | PostgreSQL (Neon) + Prisma ORM v7 |
| Auth | NextAuth v5 — Credentials, Google OAuth, Resend magic-link |
| Styling | Tailwind CSS v4, shadcn/ui, Framer Motion |
| Storage | Vercel Blob |
| Rate limiting | Upstash Redis |
| Monitoring | Sentry, Microsoft Clarity, Vercel Analytics |
| Testing | Vitest + React Testing Library |

## Prasyarat

- Node.js 20+
- PostgreSQL (atau akun [Neon](https://neon.tech))
- Akun [Resend](https://resend.com) untuk email
- Akun [Tripay](https://tripay.co.id) untuk payment gateway

## Instalasi

```bash
git clone https://github.com/BodeTAP/my-website.git
cd my-website
npm install
```

Buat file `.env.local` dan isi variabel berikut:

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=                    # generate: openssl rand -base64 32
NEXT_PUBLIC_SITE_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

AUTH_RESEND_KEY=
EMAIL_FROM=noreply@yourdomain.com

TRIPAY_API_KEY=
TRIPAY_MERCHANT_CODE=
TRIPAY_SANDBOX=true

BLOB_READ_WRITE_TOKEN=

ANTHROPIC_API_KEY=
PEXELS_API_KEY=

NEXT_PUBLIC_SENTRY_DSN=
```

Jalankan migrasi dan seed database:

```bash
npx prisma migrate dev
npx prisma db seed
```

Jalankan development server:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Jalankan production build
npm run lint         # ESLint
npm test             # Vitest watch mode
npm run test:run     # Vitest sekali jalan
npx prisma studio    # GUI database
npx prisma migrate dev   # Jalankan migrasi
npx prisma db seed       # Seed database
```

## Struktur Zona

```
/                    → Public marketing site
/admin               → Dashboard admin (role: ADMIN)
/portal              → Client portal (role: CLIENT)
/onboarding/[token]  → Form onboarding klien baru
/bayar/[invoiceNo]   → Halaman pembayaran invoice
```

Akun admin dibuat via seed atau langsung di database dengan `role: "ADMIN"`.

## Deployment

Project ini di-deploy ke [Vercel](https://vercel.com). Layanan eksternal yang dibutuhkan:

- **Neon** — PostgreSQL dengan connection pooling (gunakan pooled URL untuk `DATABASE_URL` di production)
- **Upstash Redis** — rate limiting lintas serverless instances (`KV_REST_API_URL`, `KV_REST_API_TOKEN`)
- **Vercel Blob** — penyimpanan gambar upload
- **Cloudflare Worker** — proxy untuk webhook Tripay (lihat `cloudflare-worker/`)

CI/CD via GitHub Actions — setiap push ke `main` otomatis menjalankan lint, typecheck, dan build.
