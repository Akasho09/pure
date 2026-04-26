# 🕌 Masjid Committee Management System

A production-ready web application for managing village masjid finances, family records, monthly contributions, and donations.

---

## ✨ Features

- **Dashboard** — Live stats: total families, members, monthly collections, pending dues
- **Family Management** — Add, edit, delete families with address & phone
- **Member Tracking** — Per-family member list with age and role
- **Monthly Contributions** — Auto-calculate dues (members × rate), track paid/partial/unpaid
- **Donations** — Record Zakat, Sadaqah, Fitrah and other donations
- **Reports** — Filter by month/year, export to CSV
- **Admin Panel** — Secure login, generate bulk contribution records, configure rate
- **Search & Pagination** — Across all family/contribution/donation lists
- **Responsive UI** — Works on mobile, tablet, and desktop

---

## 🛠️ Tech Stack

| Layer       | Technology                         |
|-------------|-------------------------------------|
| Framework   | Next.js 14 (App Router)             |
| Language    | TypeScript                          |
| Database    | SQLite (dev) / PostgreSQL (prod)    |
| ORM         | Prisma                              |
| Auth        | iron-session (cookie-based)         |
| UI          | Tailwind CSS + shadcn/ui components |
| Validation  | Zod                                 |
| Fonts       | DM Sans + Playfair Display + Amiri  |

---

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone / Extract the project

```bash
cd masjid-management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.local .env
```

Edit `.env` and set a strong session secret:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-random-32-character-secret-here-abc123"
```

> **Tip:** Generate a secret with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 4. Set up the database

```bash
# Push schema to SQLite
npm run db:push

# Seed with sample data (5 families, contributions, donations)
npm run db:seed
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Default Admin Credentials

| Field    | Value               |
|----------|---------------------|
| Email    | admin@masjid.com    |
| Password | admin123            |

> ⚠️ Change these in production by updating the seed file and re-running, or via your database directly.

---

## 📁 Project Structure

```
masjid-management/
├── app/
│   ├── page.tsx                  # Dashboard
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles + CSS variables
│   ├── login/page.tsx            # Admin login
│   ├── families/
│   │   ├── page.tsx              # Family list
│   │   └── [id]/page.tsx         # Family detail
│   ├── contributions/page.tsx    # Monthly contributions
│   ├── donations/page.tsx        # Donations list
│   ├── reports/page.tsx          # Financial reports
│   ├── admin/page.tsx            # Admin panel
│   └── api/
│       ├── auth/                 # login, logout, me
│       ├── family/               # CRUD + [id]
│       ├── member/               # Create + [id]
│       ├── contribution/         # CRUD + generate
│       ├── donation/             # CRUD + [id]
│       ├── transaction/          # List
│       ├── dashboard/            # Stats
│       ├── report/               # Report data
│       └── settings/             # Get/update settings
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   ├── AppShell.tsx          # Page wrapper
│   │   ├── AuthProvider.tsx      # Auth context
│   │   ├── PageHeader.tsx        # Reusable page header
│   │   ├── StatsCard.tsx         # Dashboard stats card
│   │   └── StatusBadge.tsx       # Contribution/donation badges
│   ├── forms/
│   │   ├── AddFamilyModal.tsx    # Add/edit family
│   │   ├── AddMemberModal.tsx    # Add member
│   │   ├── RecordContributionModal.tsx
│   │   └── AddDonationModal.tsx
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── session.ts                # iron-session helpers
│   ├── utils.ts                  # Formatting, CSV export, helpers
│   └── validations.ts            # Zod schemas
├── prisma/
│   ├── schema.prisma             # Database models
│   └── seed.ts                   # Sample data
└── types/
    └── index.ts                  # TypeScript interfaces
```

---

## 🗄️ Database Models

```
Family ──< Member
Family ──< MonthlyContribution
Family ──< Donation
Transaction (ledger log)
Settings (global config)
Admin (auth)
```

---

## 🔌 API Reference

| Method | Endpoint                        | Description                          | Auth |
|--------|---------------------------------|--------------------------------------|------|
| GET    | /api/dashboard                  | Stats + recent transactions          | No   |
| GET    | /api/family                     | List families (search, pagination)   | No   |
| POST   | /api/family                     | Create family                        | ✓    |
| GET    | /api/family/:id                 | Family detail with members/history   | No   |
| PUT    | /api/family/:id                 | Update family                        | ✓    |
| DELETE | /api/family/:id                 | Delete family (cascades)             | ✓    |
| POST   | /api/member                     | Add member to family                 | ✓    |
| PUT    | /api/member/:id                 | Update member                        | ✓    |
| DELETE | /api/member/:id                 | Remove member                        | ✓    |
| GET    | /api/contribution               | List contributions (filter by month) | No   |
| POST   | /api/contribution               | Record/upsert contribution           | ✓    |
| POST   | /api/contribution/generate      | Bulk-generate for all families       | ✓    |
| GET    | /api/donation                   | List donations                       | No   |
| POST   | /api/donation                   | Record donation                      | ✓    |
| GET    | /api/transaction                | Transaction ledger                   | No   |
| GET    | /api/report                     | Report data (month/year filter)      | No   |
| GET    | /api/settings                   | Get settings                         | No   |
| PUT    | /api/settings                   | Update settings                      | ✓    |
| POST   | /api/auth/login                 | Admin login                          | No   |
| POST   | /api/auth/logout                | Logout                               | ✓    |
| GET    | /api/auth/me                    | Session check                        | No   |

---

## 🐘 Switching to PostgreSQL (Production)

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/masjid_db"
```

3. Re-run migrations:
```bash
npm run db:push
npm run db:seed
```

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- Sessions are encrypted via iron-session (HttpOnly, SameSite=Lax)
- All write endpoints require valid admin session
- Zod validation on all API inputs
- In production: set `SESSION_SECRET` to a 64-char random string

---

## 📊 Business Logic

### Monthly Due Calculation
```
family_due = number_of_members × amount_per_member
```
- `amount_per_member` is configurable in Admin Panel → Settings
- Default: ₹50 per member

### Contribution Status
| Paid Amount         | Status    |
|---------------------|-----------|
| = 0                 | `unpaid`  |
| > 0 and < due       | `partial` |
| ≥ due               | `paid`    |

---

## 🧪 Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run db:push      # Sync schema to database
npm run db:seed      # Insert sample data
npm run db:reset     # Reset DB + re-seed
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run lint         # ESLint
```

---

## 🌐 Deployment (Vercel)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL` (PostgreSQL connection string from Neon, Supabase, etc.)
   - `SESSION_SECRET` (random 64-char string)
4. Deploy

---

## 🎨 Design System

- **Primary color:** Emerald green (`#059669`)
- **Sidebar:** Deep forest green (dark)
- **Typography:** DM Sans (body) + Playfair Display (headings) + Amiri (Arabic)
- **Theme:** Light mode with CSS variables (dark mode ready)

---

*Built with ❤️ for the Muslim community. May Allah accept this effort.*
