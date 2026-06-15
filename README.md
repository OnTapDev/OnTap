# OnTap - Mobile Bar Operating System

All-in-one operating system for mobile bar operators. CRM, quotes, calendar, invoices, and payments in one platform.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk
- **Styling**: Tailwind CSS
- **Payments**: Stripe Connect
- **Email**: Resend

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Install Dependencies

```bash
cd on-tap
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

Required keys:
- **Clerk**: Get from [clerk.com](https://clerk.com)
- **Supabase**: Get from [supabase.com](https://supabase.com)
- **Stripe**: Get from [stripe.com](https://stripe.com)
- **Resend**: Get from [resend.com](https://resend.com)

### 3. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration SQL from `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Copy your project URL and anon key to `.env.local`

### 4. Set Up Clerk Authentication

1. Create a new application at [clerk.com](https://clerk.com)
2. Copy your publishable key and secret key to `.env.local`
3. Configure sign-in/sign-up URLs in Clerk dashboard

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (sign-in, sign-up)
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes
├── modules/               # Feature modules
│   ├── crm/               # Contacts, pipeline
│   ├── quotes/            # Quote builder
│   ├── calendar/          # Event calendar
│   ├── invoices/          # Invoicing
│   ├── staff/             # Staff management
│   └── settings/          # App settings
├── core/                  # Infrastructure
│   ├── db/                # Supabase client
│   ├── auth/              # Clerk integration
│   ├── payments/          # Stripe integration
│   └── email/             # Resend integration
├── ui/                    # Design system
│   ├── primitives/        # Base components
│   └── layouts/           # Page layouts
└── lib/                   # Utilities
```

## Design System

### Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Charcoal | `#1A1A1A` | Background |
| Warm White | `#F3E7D3` | Body text |
| Warm Gold | `#7D6854` | Titles, headings |
| Olive Gold | `#7D7254` | CTAs, accents |
| Warm Sand | `#B2A88A` | Secondary text |

### Typography

| Role | Size | Weight | Letter-spacing |
|------|------|--------|----------------|
| Screen Title | 32px | Bold | -0.02em |
| Section Title | 20px | Bold | -0.01em |
| Body | 16px | Regular | 0 |
| Meta | 14px | Regular | 0 |

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript check
```

## MVP Roadmap

### Week 1 ✅
- [x] Project setup
- [x] Design system
- [x] Auth integration
- [x] Dashboard shell

### Week 2
- [ ] Contact management
- [ ] Pipeline view
- [ ] Activity timeline

### Week 3
- [ ] Package builder
- [ ] Quote creation
- [ ] Event management

### Week 4
- [ ] Calendar view
- [ ] Availability rules

### Week 5
- [ ] Invoice generation
- [ ] Payment integration

### Week 6
- [ ] Polish & testing
- [ ] Beta launch

## License

Private - All rights reserved
