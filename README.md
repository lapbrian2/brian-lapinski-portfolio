# Brian Lapinski — AI Art Portfolio

**Ossuary: The Intelligent AI Art Gallery**

A dark, Caravaggio-inspired portfolio showcasing AI-generated artwork with an interactive prompt architecture system. Built with Nuxt 3, GSAP, Tailwind CSS, and Turso.

**Live:** [https://lapinski.art](https://lapinski.art)

---

## Features

- **3D Carousel Gallery** — CSS perspective-based rotating card ring with momentum flick physics
- **Prompt Architect Panel** — Color-coded technique tokenization across 8 categories (lighting, camera, style, mood, composition, material, color, post)
- **Fork Workflow** — Copy structured prompt templates or raw prompts to clipboard
- **Relational Knowledge Graph** — Artworks linked to techniques via junction table
- **Admin Dashboard** — Full CRUD for artworks, content, credentials, analytics
- **Contact Form** — Email via Resend with DB logging and rate limiting
- **Custom Cursor** — Dot + trailing ring with click pulse, drag affordance, and loading states
- **GSAP Animations** — Scroll reveals, page transitions, lightbox swipe with velocity detection
- **Smooth Scrolling** — Lenis integration with scroll-position reset on navigation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3.16 (Vue 3.5) |
| Database | Turso (libSQL) + Drizzle ORM |
| Styling | Tailwind CSS |
| Animation | GSAP 3.12 + Lenis |
| Email | Resend |
| Image Storage | Vercel Blob |
| Hosting | Vercel (SSR) |
| Fonts | PP Neue Montreal |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- A [Turso](https://turso.tech) database
- A [Resend](https://resend.com) API key (for contact form emails)

### 1. Clone and install

```bash
git clone https://github.com/lapbrian2/brian-lapinski-portfolio.git
cd brian-lapinski-portfolio
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables) below).

### 3. Set up the database

```bash
# Push schema to your Turso database
npm run db:push

# Seed with artwork data (42 artworks, 40+ techniques, 196 mappings)
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env` file from `.env.example`:

| Variable | Required | Description |
|----------|----------|-------------|
| `TURSO_DATABASE_URL` | Yes | Turso connection URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Yes | Turso authentication token |
| `RESEND_API_KEY` | No | Resend API key for sending contact emails |
| `RESEND_FROM_EMAIL` | No | Sender email (default: `noreply@lapinski.art`) |
| `CONTACT_NOTIFICATION_EMAIL` | No | Where contact submissions go (default: `brianlapinskiart@gmail.com`) |
| `ADMIN_PASSWORD` | Yes | Password for the admin dashboard |
| `ADMIN_SESSION_SECRET` | Yes | Random 32+ char string for signing session cookies |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token for admin image uploads |
| `SITE_URL` | No | Public URL (default: `https://lapinski.art`) |

**Note:** The contact form works without Resend — submissions are still saved to the database. Email sending fails gracefully.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run db:push` | Push schema changes directly to database |
| `npm run db:generate` | Generate migration SQL files from schema |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:seed` | Seed database with artwork data |
| `npm run db:studio` | Open Drizzle Studio (visual DB editor) |

---

## Database

### Schema

9 tables managed by Drizzle ORM:

- **artworks** — Gallery entries with metadata, prompts, and technique data
- **techniques** — Prompt technique catalog (51 entries across 8 categories)
- **artworkTechniques** — Many-to-many junction linking artworks to techniques
- **content** — Key-value store for editable text (bio, pullquote, etc.)
- **credentials** — Exhibitions and credentials
- **stats** — Counter stats displayed on the site
- **pageViews** — Analytics page view tracking
- **sessions** — Admin authentication sessions
- **contactSubmissions** — Contact form entries

### Migrations

Schema changes use Drizzle Kit's migration workflow:

```bash
# After editing server/db/schema.ts:
npm run db:generate    # Generate SQL migration file
npm run db:migrate     # Apply migration to database
```

Migration files are stored in `server/db/migrations/` and committed to version control.

For rapid local development, you can also use `npm run db:push` to sync schema directly (no migration file generated).

### Seed Data

The seed script (`server/db/seed.ts`) is idempotent — safe to re-run:

```bash
npm run db:seed
```

Seeds 42 artworks, 51 techniques, 196 artwork-technique mappings, bio content, credentials, and stats.

---

## Project Structure

```
brian-lapinski-portfolio/
├── assets/css/            # Global styles, transitions, typography
├── components/
│   ├── about/             # About section
│   ├── admin/             # Admin dashboard UI
│   ├── contact/           # Contact form
│   ├── gallery/           # Carousel, grid, lightbox, Architect Panel
│   ├── global/            # Header, footer, cursor
│   ├── hero/              # Hero section with crossfade
│   ├── process/           # Process section
│   └── ui/                # Reusable UI primitives
├── composables/           # Vue composables (useArtworks, useLightbox, etc.)
├── layouts/               # Default + admin layouts
├── middleware/             # Admin auth middleware
├── pages/
│   ├── admin/             # Admin dashboard pages
│   ├── [category].vue     # Dynamic category pages
│   └── index.vue          # Homepage
├── plugins/               # GSAP + Lenis client plugins
├── public/images/         # Artwork images (optimized .webp)
├── server/
│   ├── api/               # API endpoints (artworks, contact, admin, auth)
│   ├── db/                # Schema, migrations, seed, connection
│   ├── middleware/         # Analytics tracking, admin auth
│   ├── routes/            # Sitemap generator
│   └── utils/             # Response helpers
└── types/                 # TypeScript definitions
```

---

## Deployment

### Vercel (recommended)

The project auto-deploys via GitHub integration:

1. Push to `master` triggers production deployment
2. Environment variables must be set in Vercel project settings
3. After first deploy, run `npm run db:seed` locally to populate the database

### Required Vercel Environment Variables

Set all variables from the [Environment Variables](#environment-variables) table in your Vercel project settings under **Settings > Environment Variables**.

### First-Time Setup

```bash
# 1. Create Turso database
turso db create lapinski-portfolio

# 2. Get credentials
turso db show lapinski-portfolio --url
turso db tokens create lapinski-portfolio

# 3. Set env vars in Vercel dashboard

# 4. Push schema and seed
npm run db:push
npm run db:seed

# 5. Deploy
git push origin master
```

---

## Admin Dashboard

Access at `/admin/login` with the password set in `ADMIN_PASSWORD`.

Features:
- Artwork CRUD with image upload to Vercel Blob
- Content editor (bio paragraphs, pullquote)
- Credentials and stats management
- Contact form submission viewer
- Analytics dashboard (page views, referrers, daily trends)

---

## License

All artwork and creative content is copyright Brian Lapinski. Code is provided for reference only.
