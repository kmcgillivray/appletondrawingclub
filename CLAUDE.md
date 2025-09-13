# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (includes post generation)
- `npm run preview` - Preview production build
- `npm run generate:posts` - Generate blog post data from markdown files
- `npm run prepare` - Sync SvelteKit (runs on install)
- `supabase functions deploy register --no-verify-jwt` - Deploy registration Edge Function
- `supabase functions deploy create-checkout --no-verify-jwt` - Deploy Stripe checkout Edge Function
- `supabase functions deploy stripe-webhook --no-verify-jwt` - Deploy Stripe webhook Edge Function
- `supabase functions deploy get-checkout-session --no-verify-jwt` - Deploy checkout session retrieval

## Architecture Overview

This is a **SvelteKit static site** for the Appleton Drawing Club, configured for static site generation using `@sveltejs/adapter-static`. The site combines static content with dynamic registration functionality via Supabase Edge Functions. The site features:

### Content Management System

- **Blog posts** are stored as markdown files in `src/posts/` with custom front matter format using `----` delimiter
- **Events** are managed in `src/lib/data/events.ts` as a TypeScript object with full type safety
- **Post generation** happens via `scripts/generate-posts.js` which:
  - Parses markdown files with custom front matter format
  - Processes mixed HTML/Markdown content using `marked`
  - Outputs to `src/lib/data/posts.js` for static consumption
  - Extracts metadata for preview cards (images, excerpts)
  - Handles date formatting from filenames (YYYY-MM-DD format)

### SvelteKit Structure

- **Static prerendering** is enabled across the site (`prerender = true`)
- **Dynamic routes**: `/posts/[slug]` for individual blog posts
- **Event system**: Events have different types (`figure_drawing`, `workshop`, `portrait`, `special_event`) and statuses
- **Component library**: Reusable components in `src/lib/components/` for events, blog posts, and UI elements
- **Registration system**: Dynamic event registration with dual payment options (Stripe online + pay-at-door)

### Registration System Architecture

- **Frontend**: `RegistrationForm.svelte` component with dual payment options, `CheckoutModal.svelte` for Stripe integration
- **Backend**: Supabase Edge Functions handle registration, Stripe checkout sessions, and webhook processing
- **Payment Processing**: Stripe embedded checkout with secure card payments and webhook confirmation
- **Database**: PostgreSQL with Row Level Security (RLS) policies
- **Authentication**: Service role authentication for database writes, publishable key for client requests
- **Security**: PCI-compliant payments, webhook signature verification, honeypot field, server-side validation

### Styling & Assets

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no separate config file)
- **Cloudinary** for image hosting and transformation
- **Custom CSS** in `src/app.css` for additional styling

### Key Files to Understand

- `scripts/generate-posts.js` - Post generation logic with custom parsing
- `src/lib/data/events.ts` - All event data with detailed TypeScript structure
- `src/lib/utils/events.js` - Event filtering and utility functions
- `src/routes/posts/[slug]/+page.js` - Dynamic post loading with prerendering entries
- `svelte.config.js` - Static adapter configuration with 404 handling
- `src/lib/components/RegistrationForm.svelte` - Event registration form with dual payment options
- `src/lib/components/CheckoutModal.svelte` - Stripe embedded checkout modal component
- `src/lib/types.ts` - TypeScript interfaces for events and registration
- `supabase/functions/register/index.ts` - Pay-at-door registration Edge Function
- `supabase/functions/create-checkout/index.ts` - Stripe checkout session creation
- `supabase/functions/stripe-webhook/index.ts` - Payment confirmation webhook handler
- `supabase/functions/get-checkout-session/index.ts` - Session status retrieval
- `supabase/functions/_shared/` - Shared utilities and types for Edge Functions

### Registration Flow Files

- `src/lib/utils/markdown.js` - Markdown rendering utility for rich event descriptions
- `src/routes/events/test-event/+page.svelte` - Example event page with registration
- `src/routes/checkout/return/+page.svelte` - Stripe payment return URL handler
- `.claude/tasks/` - Task documentation for implemented features and future enhancements

### Build Process

The build process requires generating posts before building (`npm run generate:posts && vite build`), ensuring all blog post data is available for static generation.

## Environment Variables

Environment variables are documented in the example files with detailed descriptions:

- **Frontend (SvelteKit)**: See `.env.local.example` for client-side and server-side variables
- **Edge Functions (Supabase)**: See `supabase/functions/.env.example` for backend service configuration

The example files include security notes and deployment guidance for each variable.

## Registration System Details

### Database Schema

The registration system uses a `registrations` table with the following structure:

- `id` (UUID) - Primary key
- `event_id` (TEXT) - References event ID from events.ts
- `name` (TEXT) - Registrant's name
- `email` (TEXT) - Registrant's email
- `payment_method` (TEXT) - 'door' for pay-at-door, 'online' for Stripe payments
- `payment_status` (TEXT) - 'pending' for pay-at-door, 'completed' for successful online payments
- `newsletter_signup` (BOOLEAN) - Newsletter preference
- `created_at` (TIMESTAMP) - Registration timestamp

### Security Model

- **Row Level Security (RLS)** enabled on registrations table
- **Service role policy** allows Edge Functions to read/write
- **Client requests** use publishable key but cannot directly access database
- **Edge Functions** use secret key with elevated permissions
- **No JWT verification** required (`--no-verify-jwt`) for public registration

### Anti-Spam Protection

- **Honeypot field** - Hidden "website" field that bots fill out
- **Server-side validation** - Email format, required fields, data sanitization
- **CORS restrictions** - Will limit origins to legitimate domains (planned)
- **Input validation** - Prevents malicious data injection

## Event Data Structure

Events in `src/lib/data/events.ts` follow this TypeScript interface:

- `id` - Unique identifier for the event
- `title` - Event name
- `date` - ISO date string (YYYY-MM-DD)
- `time` - Human-readable time string
- `location` - Structured address object with name and postal address
- `summary` - Short plain-text description for previews and meta tags
- `description` - Detailed description (supports markdown)
- `price` - Numeric price (0 for free events)
- `event_type` - One of: 'figure_drawing', 'portrait', 'workshop', 'special_event'
- `status` - 'registration_open' or 'completed'
- Optional fields: `model`, `instructor`, `special_notes`, `image_url`, `capacity`

## Deployment Notes

### Frontend Deployment (Netlify)

- Build command: `npm run build`
- Publish directory: `build`
- Environment variables set in Netlify dashboard
- Deploy previews supported for testing

### Backend Deployment (Supabase)

- Deploy with:
  - `supabase functions deploy register --no-verify-jwt`
  - `supabase functions deploy create-checkout --no-verify-jwt`
  - `supabase functions deploy stripe-webhook --no-verify-jwt`
  - `supabase functions deploy get-checkout-session --no-verify-jwt`
- Environment variables set in Supabase Edge Functions dashboard
- Functions are automatically versioned and can be rolled back
- Logs available in Supabase dashboard for debugging
- **Stripe Webhook Setup**: Configure endpoint `https://your-project.supabase.co/functions/v1/stripe-webhook` in Stripe Dashboard
