# Appleton Drawing Club Platform Development Plan

## Project Overview

Transform appletondrawingclub.com from a static informational site into a comprehensive platform for course sales, event management, and membership services. Build incrementally to minimize risk and validate each feature before expanding.

## Current State

- Static website hosted on Netlify
- Event registration through Eventbrite
- Manual event management
- Newsletter signup via Buttondown
- 8-30 attendees per event
- $15 standard sessions, $35-75 workshops

## Tech Stack

**Frontend & Hosting:**

- SvelteKit (progressive enhancement, SSR)
- Netlify (hosting, forms, functions)

**Backend Services:**

- Supabase (database, authentication, file storage)
- Stripe (payments, subscriptions)
- Resend or SendGrid (transactional emails)

**Video Storage:**

- Supabase Storage (initial)
- Mux (future scaling option)

## Development Phases

### Phase 0: Tech Stack Transfer (2-3 weeks)

**Goal:** Move current static site system over to new SvelteKit stack and static rendering

**Current Site Analysis:**

- 5 main pages: Events, For models, FAQs, About, Contact
- Additional pages: Code of conduct, Blog
- External integrations: Eventbrite (event links), Buttondown (newsletter), Cloudinary (images)
- Simple, content-focused design with mobile-friendly layout

**Technical Migration Tasks:**

_Week 1: Project Setup & Core Pages_

- Initialize SvelteKit project with `@sveltejs/adapter-static`
- Configure `svelte.config.js` for static site generation
- Set up Netlify deployment pipeline with `netlify.toml`
- Create responsive layout component matching current design
- Migrate core static pages (About, FAQs, Contact, Code of conduct)
- Implement navigation system and footer

_Week 2: Content & Integrations_

- Create blog/inspiration content system using markdown
- Migrate existing blog post and create template for future posts
- Set up image optimization and CDN integration
- Implement newsletter signup form (Buttondown integration)
- Create events listing page (static content initially)
- Add social media links and external integrations

_Week 3: Polish & Deploy_

- Implement SEO metadata and Open Graph tags
- Add analytics tracking (if currently used)
- Performance optimization and accessibility audit
- Set up automated deployment from Git repository
- Domain migration and DNS updates
- Content review and final testing

**Deliverables:**

- Fully functional SvelteKit static site replicating current functionality
- Netlify deployment pipeline with automatic builds
- Preserved SEO rankings and external integrations
- Foundation prepared for Phase 1 dynamic features

**Success Criteria:**

- Site loads faster than current version
- All current content and functionality preserved
- Mobile responsiveness maintained or improved
- Easy content updates for blog posts
- Zero downtime during migration

### Phase 0.1: Single Event MVP (2-3 weeks)

**Goal:** Test event management system with minimal backend complexity

**Core Features:**

- Single event creation with details, pricing, capacity limit
- Event duplication/templating system (solves biggest Eventbrite pain point)
- Guest checkout registration (no user accounts needed)
- Stripe payment OR "pay at door" option
- Newsletter signup checkbox with automatic sync to Buttondown
- Basic registration confirmation email
- Simple admin dashboard to view registrations
- Manual attendance tracking (checkbox list)
- Basic refund processing via Stripe dashboard

**Simplified Backend:**

- Supabase for registration data storage
- Netlify Functions for form processing
- Stripe webhooks for payment confirmation
- Single event workflow (test before expanding)

**Success Criteria:**

- Faster event setup than Eventbrite
- Automatic newsletter sync eliminates manual work
- Owned customer data and relationships
- Seamless registration experience for attendees
- Ready to scale to multiple events

### Phase 1: Full Event Management System (4-6 weeks)

**Goal:** Replace Eventbrite with owned solution

**Core Features:**

- Dynamic event calendar
- User registration and authentication
- Online payment via Stripe
- "Pay at door" registration option
- Mobile-friendly check-in interface
- Refund processing system
- Admin panel for event management

**Email Automation:**

- Registration confirmation
- Event reminder (24hrs prior)
- Post-event follow-up
- Admin notifications

**Admin Capabilities:**

- Create and edit events
- View registration lists
- Process check-ins during events
- Issue refunds
- Mark "pay at door" as paid

### Phase 2: Single Course System (3-4 weeks)

**Goal:** Launch first video course, validate concept

**Core Features:**

- Course detail and preview page
- Multi-chapter video structure
- Video upload and secure storage
- Purchase flow integration
- Access control (paid users only)
- Progress tracking per chapter
- Course completion tracking

**Course Management:**

- Admin interface for course creation
- Video upload and organization
- Chapter ordering and descriptions

### Idea X: Session packages / initial memberships

**Goal:** Support buying a season pass or multi session pass to events, or an initial membership

**Core Features:**

- 6-10 session package with tracking for how many sessions have been used
- Automatic free registration or discounted registration depending on event type
- Alternatively, a monthly / quarterly membership with these benefits

### Idea X: Enhanced Course Platform (2-3 weeks)

**Goal:** Support multiple courses and pricing tiers

**Expanded Features:**

- Course catalog with filtering
- Multiple pricing models (single video, mini-course, full course)
- Course bundles and packages
- Enhanced progress analytics
- Course reviews and ratings
- Search and discovery features

### Idea X: Membership System (3-4 weeks)

**Goal:** Subscription-based member benefits

**Membership Features:**

- Stripe subscription management
- Tiered membership levels
- Automatic member pricing on events
- Member-only course access
- Exclusive resource library
- Member directory or community features

**Member Benefits:**

- Discounted event pricing
- Free access to course library
- Exclusive drawing resources
- Priority event registration

## Key Requirements by Phase

### Phase 1 Requirements

- Replace Eventbrite functionality completely
- Maintain current payment options (online + door)
- Streamline check-in process for events
- Professional email communications
- Simple refund processing
- Mobile-responsive admin interface

### Phase 2 Requirements

- Secure video delivery with access control
- Intuitive course navigation
- Progress persistence across sessions
- Professional course presentation
- Integration with existing user accounts

### Phase 3 Requirements

- Support for diverse course formats
- Flexible pricing strategies
- Course discovery and browsing
- Bundle and package options

### Phase 4 Requirements

- Subscription billing and management
- Member benefit automation
- Integration with events and courses
- Member retention features

## Success Metrics by Phase

**Phase 1:**

- Elimination of Eventbrite fees
- Improved attendee communication
- Streamlined event operations
- Maintained or increased event attendance

**Phase 2:**

- First course revenue
- Course completion rates
- User engagement with video content

**Phase 3:**

- Multiple active courses
- Diverse pricing validation
- Course discovery effectiveness

**Phase 4:**

- Recurring subscription revenue
- Member retention rates
- Increased lifetime customer value

## Risk Mitigation

- **Incremental delivery:** Each phase delivers immediate value
- **Revenue validation:** Test pricing and demand early
- **Technical simplicity:** Choose maintainable, well-documented technologies
- **Fallback options:** Maintain existing systems until new ones are proven
- **Solo sustainability:** Prioritize low-maintenance, automated solutions

## Long-term Vision

Create a comprehensive platform that serves the drawing community with:

- Professional event experiences
- High-quality educational content
- Sustainable membership model
- Owned customer relationships
- Automated operations suitable for solo management
