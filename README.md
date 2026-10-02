# Shopflow — E-Commerce Shop

A modern, responsive online shop with cart, checkout, Google authentication, order persistence in Supabase, and order confirmation emails via Mailgun.

## Features

- **Shop page** with product grid, product cards (image, name, description, price, add-to-cart)
- **Shopping cart** — add, remove, increase/decrease quantity, subtotal, total, item count
- **Cart persistence** — cart survives page refresh via localStorage
- **Checkout page** (`/checkout` equivalent) with customer form (name, email, phone, address), order summary, and form validation
- **Order success page** with order number
- **Google authentication** — sign in / sign out, user name and avatar displayed
- **Database** — products, orders, and order_items stored in Supabase (PostgreSQL)
- **Order confirmation emails** — sent via Mailgun through a Supabase Edge Function (API keys never exposed to the frontend)
- **Responsive** — mobile, tablet, iPad, desktop with no horizontal scrolling
- **Loading, error, and success states** throughout

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Icons | Lucide React |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Emails | Mailgun (via Supabase Edge Function) |
| Testing | Vitest + React Testing Library |

## Setup

### Prerequisites
- Node.js 18+
- npm
- A Supabase project (one is already provisioned for this project)
- A Mailgun account (for order emails)
- A Google Cloud Console project (for Google OAuth)

### Install and Run Locally

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

### Environment Variables

The `.env` file is pre-populated with Supabase credentials. You only need to configure Mailgun secrets and Google OAuth separately (see below).

**Frontend (.env):**
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL (pre-populated) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key (pre-populated) |

**Edge Function secrets (set in Supabase dashboard → Edge Functions → Secrets):**
| Variable | Description |
|----------|-------------|
| `MAILGUN_API_KEY` | Your Mailgun API key |
| `MAILGUN_DOMAIN` | Your Mailgun sending domain |
| `MAILGUN_FROM` | From address for order emails (e.g. `orders@mail.yourdomain.com`) |

### Configuration: Supabase

The database tables (products, orders, order_items) are already created and seeded with 9 products. No further setup needed unless you want to use your own Supabase project.

### Configuration: Google Cloud Console (for Google OAuth)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Set application type to **Web application**
6. Add your Supabase project's auth callback URL as an authorized redirect URI:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - For local dev: `http://localhost:5173`
7. Copy the **Client ID** and **Client Secret**
8. Go to your Supabase dashboard → **Authentication → Providers**
9. Enable **Google** and paste the Client ID and Client Secret
10. Save

### Configuration: Mailgun

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Add and verify your sending domain (e.g. `mail.yourdomain.com`)
3. Go to **API Keys** and copy your private API key
4. In the Supabase dashboard, go to **Edge Functions → Secrets**
5. Add these secrets:
   - `MAILGUN_API_KEY` = your private API key
   - `MAILGUN_DOMAIN` = your sending domain (e.g. `mail.yourdomain.com`)
   - `MAILGUN_FROM` = `Shopflow Orders <orders@mail.yourdomain.com>`

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |
| `npm run test` | Run tests |

## Testing

Tests cover:
- Adding a product to cart
- Removing a product from cart
- Increasing/decreasing cart quantity
- Calculating subtotal and total
- Checkout form validation (required fields, email format)
- Order submission with valid data

```bash
npm run test
```

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx          # Top nav with logo, auth, cart icon
│   ├── ProductGrid.tsx     # Grid with loading/error/empty states
│   ├── ProductCard.tsx     # Single product card with add-to-cart
│   ├── CartDrawer.tsx      # Slide-out cart with qty controls
│   ├── CheckoutPage.tsx    # Checkout form + order summary
│   └── OrderSuccess.tsx    # Confirmation with order number
├── context/
│   ├── CartContext.tsx     # Cart state + localStorage persistence
│   └── AuthContext.tsx     # Google auth via Supabase
├── lib/
│   ├── supabase.ts         # Supabase client
│   └── api.ts              # Product fetch + order creation + email trigger
├── types/index.ts          # TypeScript types
├── test/                   # Tests
└── App.tsx                 # Root with view routing

supabase/
├── config.toml             # Edge function config
└── functions/
    └── send-order-email/   # Mailgun edge function
```

## Deployment

### Vercel
1. Push the repository to GitHub
2. Import the project in Vercel
3. Set environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Deploy — Vercel auto-detects Vite

### Other platforms
The frontend is a standard Vite app. Build with `npm run build` and serve the `dist/` folder.

## License
MIT
