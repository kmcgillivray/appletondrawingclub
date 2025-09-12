# Appleton Drawing Club Website

A modern SvelteKit website for the Appleton Drawing Club featuring static content generation and dynamic event registration capabilities.

## Features

- 📅 **Event Management** - Display upcoming and past drawing events with detailed information
- 📝 **Event Registration** - Pay-at-door registration system with anti-spam protection
- 📰 **Blog System** - Markdown-based blog posts with automatic generation
- 🔒 **Secure Backend** - Supabase Edge Functions for registration processing
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS

## Architecture

### Frontend

- **SvelteKit** with static site generation (`@sveltejs/adapter-static`)
- **Tailwind CSS v4** for styling
- **TypeScript** for type safety
- **Cloudinary** for image hosting and transformation

### Backend

- **Supabase** for database and Edge Functions
- **Row Level Security (RLS)** for data protection
- **Anti-spam protection** with honeypot validation

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

   Copy `.env.local.example` to `.env.local` and configure:

   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

   # For Edge Functions (server-side only)
   SB_SECRET_KEY=your_supabase_secret_key
   ```

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

### Backend (Supabase Edge Functions)

```bash
# Deploy registration function
supabase functions deploy register --no-verify-jwt

# Set environment variables in Supabase dashboard
# - SB_SECRET_KEY (your secret key)
# - SUPABASE_URL (your project URL)
```

## Event Registration System

The registration system allows users to register for drawing events with payment at the door:

### User Flow

1. User visits event page
2. Fills out registration form (name, email, newsletter preference)
3. Submits form with anti-spam protection
4. Receives confirmation and pays at the event

### Security Features

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
│   │   └── EventCard.svelte
│   ├── data/            # Static data files
│   │   ├── events.ts    # Event definitions (TypeScript)
│   │   ├── events.yaml  # Event data backup/import format
│   │   └── posts.ts     # Generated blog posts (TypeScript)
│   ├── types.ts         # TypeScript type definitions
│   └── utils/           # Utility functions
├── posts/               # Markdown blog posts
├── routes/              # SvelteKit routes
└── app.html            # HTML template

supabase/
└── functions/
    ├── register/        # Registration Edge Function
    └── _shared/         # Shared utilities and types

scripts/
└── generate-posts.js    # Blog post generation script
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production (includes post generation)
- `npm run preview` - Preview production build
- `npm run generate:posts` - Generate blog post data from markdown files
- `npm run prepare` - Sync SvelteKit (runs on install)

## Environment Variables

### Required for Frontend

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase publishable key for client-side requests

### Required for Edge Functions

- `SB_SECRET_KEY` - Supabase secret key for server-side database operations
- `SUPABASE_URL` - Your Supabase project URL (same as VITE_SUPABASE_URL)

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
