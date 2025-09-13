# Appleton Drawing Club Website

A modern SvelteKit website for the Appleton Drawing Club featuring static content generation and dynamic event registration capabilities.

## Features

- 📅 **Event Management** - Display upcoming and past drawing events with detailed information
- 📝 **Event Registration** - Dual payment system: online Stripe payments and pay-at-door with anti-spam protection
- 📰 **Blog System** - Markdown-based blog posts with automatic generation
- 🔒 **Secure Backend** - Supabase Edge Functions for registration and Stripe payment processing
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS

## Architecture

### Frontend

- **SvelteKit** with static site generation (`@sveltejs/adapter-static`)
- **Tailwind CSS v4** for styling
- **TypeScript** for type safety
- **Cloudinary** for image hosting and transformation

### Backend

- **Supabase** for database and Edge Functions
- **Stripe** for secure online payment processing
- **Row Level Security (RLS)** for data protection
- **Anti-spam protection** with honeypot validation
- **Webhook handling** for payment confirmation

### Content Management

- **Markdown blog posts** in `src/posts/` with custom front matter
- **Event data** managed in `src/lib/data/events.ts`
- **Automatic post generation** from markdown files to TypeScript

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Netlify account (for deployment)

### Installation

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd appletondrawingclub
   npm install
   ```

2. **Set up environment variables**

   Copy `.env.local.example` to `.env.local` and fill in your actual values.
   See the example file for detailed descriptions of each variable.

3. **Set up Supabase**

   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login and link to your project
   supabase login
   supabase link --project-ref your-project-ref

   # Run existing migrations to set up database schema
   supabase db push

   # Deploy Edge Functions
   supabase functions deploy register --no-verify-jwt
   supabase functions deploy create-checkout --no-verify-jwt
   supabase functions deploy stripe-webhook --no-verify-jwt
   supabase functions deploy get-checkout-session --no-verify-jwt
   ```

   The database schema is already defined in `supabase/migrations/` and includes:

   - `registrations` table for event registration data
   - Row Level Security (RLS) policies
   - Service role permissions for Edge Functions

### Development

For local development, you can run Supabase locally to avoid using production resources:

1. **Start local Supabase** (optional but recommended)

   ```bash
   # Start local Supabase services (database, Edge Functions, etc.)
   supabase start

   # This will provide local URLs like:
   # API URL: http://localhost:54321
   # DB URL: postgresql://postgres:postgres@localhost:54322/postgres
   ```

2. **Update environment for local development**

   ```bash
   # Use local Supabase URLs in .env.local
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=your_local_anon_key  # Provided by supabase start
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Generate blog posts** (if you have markdown posts)

   ```bash
   npm run generate:posts
   ```

5. **Test registration locally**
   - Visit `http://localhost:5173/events/test-event` to test registration
   - Registrations will be stored in local database
   - View local database at `http://localhost:54323` (Supabase Studio)

**Alternative: Use remote Supabase for development**
If you prefer to develop against the remote database, just use your production Supabase URLs in `.env.local`.

### Building

```bash
# Generate posts and build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Frontend (Netlify)

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Configure environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`

### Backend (Supabase Edge Functions)

```bash
# Deploy all Edge Functions
supabase functions deploy --no-verify-jwt

# Set up Edge Functions environment variables
# Copy supabase/functions/.env.example to supabase/functions/.env
# Then configure in Supabase dashboard or use the local .env file
```

### Stripe Webhook Configuration

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Listen for events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy webhook signing secret to environment variables

## Event Registration System

The registration system supports both online payment and pay-at-door options:

### Payment Options

**Online Payment (Stripe)**:

1. User selects "Pay Online" option
2. Stripe embedded checkout opens in modal
3. Secure card payment processing
4. Automatic registration confirmation
5. Webhook handles database updates

**Pay at Door**:

1. User selects "Pay at Door" option
2. Registration is created with pending status
3. User pays cash/card at the event
4. Manual confirmation by organizers

### Security Features

- **PCI-compliant payments** through Stripe
- **Webhook signature verification** for payment confirmation
- **Honeypot field** prevents basic bot spam
- **Server-side validation** ensures data integrity
- **CORS protection** restricts API access to legitimate domains
- **Row Level Security** protects database access

## Project Structure

```
src/
├── lib/
│   ├── components/       # Reusable Svelte components
│   │   ├── RegistrationForm.svelte
│   │   ├── CheckoutModal.svelte
│   │   ├── RegistrationMessages.svelte
│   │   └── EventCard.svelte
│   ├── data/            # Static data files
│   │   ├── events.ts    # Event definitions (TypeScript)
│   │   ├── events.yaml  # Event data backup/import format
│   │   └── posts.ts     # Generated blog posts (TypeScript)
│   ├── types.ts         # TypeScript type definitions
│   └── utils/           # Utility functions
├── posts/               # Markdown blog posts
├── routes/              # SvelteKit routes
│   ├── checkout/
│   │   └── return/      # Stripe payment return handler
│   └── events/
└── app.html            # HTML template

supabase/
├── functions/
│   ├── register/        # Pay-at-door registration
│   ├── create-checkout/ # Stripe checkout session creation
│   ├── stripe-webhook/  # Payment confirmation webhook
│   ├── get-checkout-session/ # Session status retrieval
│   └── _shared/         # Shared utilities and types
└── migrations/          # Database schema

scripts/
└── generate-posts.js    # Blog post generation script
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production (includes post generation)
- `npm run preview` - Preview production build
- `npm run generate:posts` - Generate blog post data from markdown files
- `npm run prepare` - Sync SvelteKit (runs on install)
- `supabase functions deploy <function-name> --no-verify-jwt` - Deploy individual Edge Functions

## Environment Variables

Environment variables are documented in the example files:

- **Frontend variables**: See `.env.local.example` for SvelteKit configuration
- **Edge Functions variables**: See `supabase/functions/.env.example` for backend services

Copy the example files and fill in your actual values.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally including registration flow
4. Deploy Edge Functions to test environment if needed
5. Create pull request

## Support

For issues or questions:

- Check existing issues in the repository
- Review task documentation in `.claude/tasks/`
- Consult the CLAUDE.md file for architecture details

---

Built with ❤️ for the Appleton Drawing Club community
