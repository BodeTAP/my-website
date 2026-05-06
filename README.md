# MFWEB

Platform SaaS full-stack untuk digital agency — mengelola leads, klien, proyek, invoice, dan konten dari satu dashboard admin yang terintegrasi.

---

## Fitur

### Public Site
- Blog dengan SEO lengkap (JSON-LD, sitemap otomatis, meta tags)
- Halaman portfolio, layanan, tentang, kontak
- **Tools gratis publik**: Cek kecepatan, Cek SEO, Generator nama bisnis, QR Code, ROI kalkulator, Cek meta tags, Estimasi harga website (AI streaming)
- Kalkulator harga interaktif
- Cookie consent, Facebook Pixel, Google Analytics, Microsoft Clarity

### Admin Dashboard

#### CRM & Leads
- Manajemen leads dengan filter status (Baru / Follow-up / Deal / Selesai)
- **Lead Finder** — cari bisnis lokal dari Google Maps API, filter yang belum punya website, simpan sebagai lead
- Pagination dengan pilihan jumlah item per halaman (10 / 25 / 50 / 100)
- Export leads ke CSV (kompatibel Google Sheets)
- Bulk delete leads

#### WhatsApp Broadcast
- Kirim pesan massal ke leads terpilih via Fonnte API
- **9-layer message humanization engine** untuk menghindari deteksi spam:
  - Sinonim kata kunci (13 grup, 4 varian tiap kata)
  - Rotasi emoji bullet (10 varian)
  - Variasi pembuka (salam waktu + 6 varian kasual)
  - Hook pembuka personal (pertanyaan 30% / statistik 70%)
  - Konteks per kategori bisnis (8 kategori: food, retail, health, beauty, service, property, edu, general)
  - Variasi CTA (8 varian + tanpa CTA)
  - Variasi footer/nama pengirim (5 varian + tanpa footer)
  - Humanisasi tanda baca
  - Zero-width character fingerprint
- **Delay non-linear** dengan distribusi bell-curve + burst pause setiap 5 pesan
- **Rotasi device per batch** — setiap sub-batch dikirim dari device berbeda
- Cooldown 24 jam per lead, rate limit 50 pesan/hari per admin
- Riwayat broadcast dengan statistik lengkap
- Template pesan WA manual yang bisa dikustomisasi

#### Manajemen Konten
- CMS artikel dengan Tiptap editor (draft/publish/scheduled)
- Analisis SEO artikel dengan AI
- Generate cover image dari Pexels → upload ke Vercel Blob
- Saran topik artikel berbasis AI dengan konteks bisnis MFWEB
- Draft balasan tiket support dengan AI

#### Manajemen Bisnis
- Klien, proyek (tracking milestone), invoice (PDF, Tripay payment), proposal
- Tiket support dengan balasan AI
- Hosting & domain tracking dengan notifikasi expiry
- Paket maintenance & subscription

#### Pengaturan Admin
- **Konfigurasi AI** — pilih model Claude (Haiku/Sonnet), toggle fitur AI per kategori
- **Tracking & Analytics** — kelola Facebook Pixel ID dan Google Analytics ID dari dashboard
- **WhatsApp Device** — konfigurasi Fonnte API key (single/multi-device rotator)
- Statistik hero beranda yang bisa dikustomisasi

#### Team Settings (RBAC)
- Sistem permission granular berbasis role (Role-Based Access Control)
- Super Admin dapat membuat/edit/hapus role dengan modul yang dikonfigurasi
- 15 modul permission: articles, leads, broadcast, clients, projects, invoices, proposals, tickets, portfolio, testimonials, hosting, maintenance, ai_settings, analytics, team
- Assignment role ke setiap admin dari satu halaman terpadu
- Tambah admin baru, reset password, hapus admin
- Sidebar navigasi adaptif — hanya tampilkan modul yang diizinkan
- Permission divalidasi dari database (bukan JWT) — perubahan berlaku segera
- Audit log setiap perubahan permission

### Client Portal
- Tracking proyek & milestone
- Download invoice PDF
- Tiket support dengan notifikasi email & WA
- **AI Assistant** (streaming) — jawab pertanyaan klien berdasarkan data proyek & invoice mereka
- Notifikasi in-app (invoice baru, balasan tiket, update proyek)

### Notifikasi Otomatis
- WhatsApp: invoice baru, pengingat tagihan, update status proyek, konfirmasi pembayaran, expiry hosting/domain
- Email: invoice, balasan tiket, update proyek (via Resend)
- In-app notifications di portal klien

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
| Payment | Tripay (VA, e-wallet, minimarket) via Cloudflare Worker proxy |
| Testing | Vitest + fast-check (property-based testing) |

---

## Arsitektur Permission (RBAC)

```
proxy.ts (Edge)
  └── Cek JWT: role === "ADMIN"
        └── AdminLayout / API Route
              └── lib/permissions.ts
                    ├── checkPermission(adminId, module) → DB query
                    ├── requireModule(module) → redirect jika ditolak
                    └── requireApiPermission(module) → 403 JSON jika ditolak
```

Permission selalu divalidasi dari database, bukan dari JWT. Perubahan role berlaku segera tanpa perlu admin login ulang.

---

## Struktur Direktori

```
app/
  (public)/          → Public marketing site
  admin/             → Admin dashboard (role: ADMIN)
    (protected)/
      leads/         → CRM leads + broadcast WA
      settings/
        team/        → Team Settings (RBAC, hanya Super Admin)
  api/admin/         → API routes admin (semua dilindungi permission guard)
  portal/            → Client portal (role: CLIENT)
  onboarding/        → Form onboarding klien
  bayar/             → Halaman pembayaran invoice

lib/
  permissions.ts     → Permission service (checkPermission, requireModule, dll)
  audit.ts           → Audit logger untuk perubahan permission
  whatsapp.ts        → sendWA, sendWABatch, sendWABatchRotated
  waTemplates.ts     → Template pesan WA (invoice, proyek, tiket, dll)
  auth.ts            → NextAuth v5 config
  email.ts           → Email via Resend
  ai.ts              → AI utilities (translate keyword, upload blob)
  aiSettings.ts      → Baca konfigurasi AI dari database
  rateLimit.ts       → Rate limiting via Upstash Redis
  tripay.ts          → Integrasi payment Tripay
  notifications.ts   → In-app notifications

components/
  admin/
    AdminShell.tsx         → Sidebar navigasi admin (adaptive)
    AdminShellServer.tsx   → Server wrapper untuk adaptive navigation
  portal/            → Komponen portal klien
  public/            → Komponen public site
  ui/                → shadcn/ui components

prisma/
  schema.prisma      → Database schema lengkap
  seed.ts            → Seed data awal
  seed-permissions.ts → Seed RBAC untuk admin yang sudah ada

tests/
  lib/               → Unit & property tests (permissions, audit, rateLimit)
  api/               → API tests (roles, members)
```

---

## Environment Variables

Buat file `.env.local`:

```env
# Database
DATABASE_URL=postgresql://...           # Neon pooled URL

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
FONNTE_API_KEY=                         # single device
# FONNTE_API_KEYS dikonfigurasi dari /admin/settings (multi-device rotator)
NEXT_PUBLIC_WHATSAPP_NUMBER=628xxx      # nomor WA admin (tanpa +)

# Lead Finder
GOOGLE_PLACES_API_KEY=                  # Google Places API (New)

# Rate limiting
KV_REST_API_URL=                        # Upstash Redis
KV_REST_API_TOKEN=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_CLARITY_PROJECT_ID=         # Microsoft Clarity (opsional)
```

> **Catatan:** Facebook Pixel ID, Google Analytics ID, Fonnte API keys, dan konfigurasi AI dikelola dari `/admin/settings` — tidak perlu env var.

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

Akun admin pertama dibuat via seed atau langsung di database dengan `role: "ADMIN"`. Admin pertama (berdasarkan `createdAt` paling awal) otomatis menjadi Super Admin.

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
npx prisma db seed       # Seed data awal + seed permissions
```

---

## Zona Aplikasi

```
/                        → Public marketing site
/blog/*                  → Blog artikel
/portfolio               → Portfolio
/tools/*                 → Tools gratis (estimasi harga AI, dll)
/admin                   → Dashboard admin (role: ADMIN)
  /leads                 → CRM + Lead Finder + Broadcast WA
  /settings              → Pengaturan situs & AI
  /settings/team         → Team Settings (RBAC) — hanya Super Admin
/portal                  → Client portal (role: CLIENT)
/onboarding/[token]      → Form onboarding klien baru
/bayar/[invoiceNo]       → Halaman pembayaran invoice
```

---

## Deployment

Di-deploy ke [Vercel](https://vercel.com). CI/CD via GitHub Actions — setiap push ke `main` otomatis menjalankan lint, typecheck, dan build.

| Layanan | Kegunaan |
|---|---|
| **Neon** | PostgreSQL + connection pooling |
| **Upstash Redis** | Rate limiting lintas serverless |
| **Vercel Blob** | Penyimpanan gambar upload |
| **Cloudflare Worker** | Proxy webhook Tripay (`cloudflare-worker/`) |
| **Fonnte** | WhatsApp API gateway (single/multi-device) |
| **Google Places API** | Lead Finder dari Google Maps |
| **Anthropic API** | Semua fitur AI (Claude Haiku/Sonnet) |
| **Pexels API** | Cover image artikel |
| **Resend** | Email transaksional |
| **Tripay** | Payment gateway (VA, e-wallet, minimarket) |

---

## Testing

Proyek menggunakan Vitest dengan property-based testing via fast-check:

```bash
npm run test:run         # Jalankan semua test sekali
```

Test mencakup:
- `tests/lib/permissions.ts` — 10 correctness properties untuk sistem RBAC
- `tests/lib/audit.ts` — Audit log selalu tercatat
- `tests/api/roles.ts` — Validasi modul, keunikan nama role, atomisitas update
- `tests/api/members.ts` — Satu admin satu role, atomisitas hapus dengan reassign
