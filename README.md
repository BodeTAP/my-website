# MFWEB

Platform SaaS full-stack untuk digital agency — mengelola leads, klien, proyek, invoice, dan konten dari satu dashboard.

## Fitur

### Public Site
- Blog, portfolio, kalkulator harga, halaman layanan dengan JSON-LD schema
- **Tools gratis**: Cek kecepatan, Cek SEO, Generator nama bisnis, QR Code, ROI kalkulator, Cek meta tags, **Estimasi harga website (AI)**
- Sitemap otomatis dengan prioritas terbobot per jenis halaman

### Admin Dashboard
- CMS artikel (Tiptap editor, draft/publish/scheduled, SEO analyzer AI)
- Manajemen leads, klien, proyek, invoice, proposal, tiket support
- **Lead Finder** — cari bisnis lokal dari Google Maps, filter yang belum punya website, simpan sebagai lead
- **WhatsApp Broadcast** — kirim pesan massal ke leads terpilih via Fonnte, auto-update status ke Follow-up
- Export leads ke CSV (kompatibel Google Sheets)
- Bulk delete leads
- **Konfigurasi AI** — pilih model (Haiku/Sonnet), toggle fitur AI per kategori
- **Tracking & Analytics** — kelola Facebook Pixel ID dan Google Analytics ID dari dashboard (tanpa redeploy)

### Client Portal
- Tracking proyek & milestone, download invoice PDF, tiket support
- **AI Assistant** (streaming) — jawab pertanyaan klien berdasarkan data proyek & invoice mereka

### AI Features (Claude API)
- Draft artikel, analisis SEO, generate cover image (Pexels → Vercel Blob), saran topik
- Draft balasan tiket support
- Estimasi harga website via streaming (tool publik)
- AI chat portal klien (streaming, context-aware)
- Model dan toggles fitur dikonfigurasi dari admin dashboard

### Payment & Notifications
- Integrasi Tripay (VA, e-wallet, minimarket) dengan Cloudflare Worker proxy
- WhatsApp notifikasi otomatis: invoice baru, pengingat tagihan, update status proyek, konfirmasi pembayaran

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Database | PostgreSQL (Neon) + Prisma ORM v7 |
| Auth | NextAuth v5 — Credentials, Google OAuth, Resend magic-link |
| Styling | Tailwind CSS v4, shadcn/ui, Framer Motion |
| Storage | Vercel Blob |
| Rate limiting | Upstash Redis |
| Monitoring | Sentry, Microsoft Clarity, Vercel Analytics, Google Analytics 4, Facebook Pixel |
| AI | Anthropic Claude (Haiku/Sonnet, configurable) |
| WhatsApp | Fonnte API |
| Testing | Vitest + React Testing Library |

---

## Environment Variables

Buat file `.env.local`:

```env
# Database
DATABASE_URL=postgresql://...           # Neon pooled URL untuk production

# Auth
AUTH_SECRET=                            # openssl rand -base64 32
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (magic link + notifikasi)
AUTH_RESEND_KEY=
EMAIL_FROM=noreply@yourdomain.com

# Payment
TRIPAY_API_KEY=
TRIPAY_MERCHANT_CODE=
TRIPAY_SANDBOX=true                     # false di production

# Storage
BLOB_READ_WRITE_TOKEN=

# AI
ANTHROPIC_API_KEY=
PEXELS_API_KEY=                         # untuk cover image artikel

# WhatsApp
FONNTE_API_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=628xxx      # nomor WA admin (tanpa +)

# Lead Finder (Google Maps)
GOOGLE_PLACES_API_KEY=                  # Google Places API (New)

# Rate limiting
KV_REST_API_URL=                        # Upstash Redis
KV_REST_API_TOKEN=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_CLARITY_PROJECT_ID=         # Microsoft Clarity (opsional)
```

> **Catatan:** Facebook Pixel ID dan Google Analytics ID dikelola dari `/admin/settings` → tab Tracking & Analytics — tidak perlu env var.

---

## Instalasi

```bash
git clone https://github.com/BodeTAP/my-website.git
cd my-website
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Akun admin dibuat via seed atau langsung di database dengan `role: "ADMIN"`.

---

## Scripts

```bash
npm run dev              # Development server
npm run build            # Production build + generate sitemap
npm run lint             # ESLint
npm test                 # Vitest watch mode
npm run test:run         # Vitest sekali jalan
npx prisma studio        # GUI database
npx prisma migrate dev   # Jalankan migrasi
npx prisma db seed       # Seed data awal
```

---

## Struktur Zona

```
/                        → Public marketing site
/tools/*                 → Tools gratis (termasuk estimasi harga AI)
/admin                   → Dashboard admin (role: ADMIN)
  /leads/finder          → Lead Finder dari Google Maps
/portal                  → Client portal (role: CLIENT)
/onboarding/[token]      → Form onboarding klien baru
/bayar/[invoiceNo]       → Halaman pembayaran invoice
```

---

## Deployment

Di-deploy ke [Vercel](https://vercel.com). Layanan eksternal:

| Layanan | Kegunaan |
|---|---|
| **Neon** | PostgreSQL + connection pooling |
| **Upstash Redis** | Rate limiting lintas serverless |
| **Vercel Blob** | Penyimpanan gambar upload |
| **Cloudflare Worker** | Proxy webhook Tripay (`cloudflare-worker/`) |
| **Fonnte** | WhatsApp API gateway |
| **Google Places API (New)** | Lead Finder dari Google Maps |
| **Anthropic API** | Semua fitur AI |
| **Pexels API** | Cover image artikel |

CI/CD via GitHub Actions — setiap push ke `main` otomatis menjalankan lint, typecheck, dan build.
