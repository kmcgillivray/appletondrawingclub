# SvelteKit Initialization Plan for Appleton Drawing Club

## Current Site Analysis Complete

**Existing Architecture:**
- Custom build system using Node.js with CommonMark, js-yaml, and Tailwind CSS
- Template-based approach with placeholder replacement (`{{ content }}`, `{{ title }}`, etc.)
- Event data stored in YAML format with sophisticated filtering logic
- Custom front matter format using `----` delimiter (not standard `---`)
- Static site generated to `public/` directory

**Key Features to Migrate:**
- Event management with upcoming/past filtering and timezone handling (America/Chicago)
- Dynamic event cards with Eventbrite integration
- Next event banner on homepage
- Blog post system with CommonMark parsing
- Newsletter integration with Buttondown
- Responsive Tailwind CSS styling
- SEO metadata and Open Graph tags

## Implementation Plan for `appletondrawingclub-svelte/`

### 1. Initialize SvelteKit Project
```bash
cd appletondrawingclub-svelte/
npx sv create . --template minimal
npm install
npm install -D @sveltejs/adapter-static tailwindcss
```

### 2. Configure for Static Site Generation
- Configure `svelte.config.js` with `@sveltejs/adapter-static`
- Set up `tailwind.config.js` matching current styles
- Add `prerender = true` to root layout

### 3. Directory Structure Setup
```
src/
├── routes/
│   ├── +layout.svelte          # Main layout (replaces template.html)
│   ├── +layout.js             # Prerender config
│   ├── +page.svelte           # Homepage (index.html content)
│   ├── about/+page.svelte     # About page
│   ├── contact/+page.svelte   # Contact page
│   ├── faq/+page.svelte       # FAQ page
│   ├── modeling/+page.svelte  # For models page
│   ├── calendar/+page.svelte  # Events calendar
│   ├── code-of-conduct/+page.svelte
│   └── posts/[slug]/+page.svelte # Dynamic blog posts
├── lib/
│   ├── data/
│   │   └── events.yaml        # Migrated events data
│   ├── components/
│   │   ├── EventCard.svelte   # Event card component
│   │   ├── NextEventBanner.svelte
│   │   └── NewsletterForm.svelte
│   └── utils/
│       └── events.js          # Event filtering logic
└── app.css                    # Tailwind CSS styles
```

### 4. Component Migration Strategy
- **Layout Component**: Convert `template.html` to SvelteKit layout with Svelte templating
- **Event System**: Port YAML loading, date filtering, and HTML generation to Svelte components
- **Blog Posts**: Implement dynamic routing for posts with front matter parsing
- **Styling**: Migrate existing Tailwind classes and custom CSS

### 5. Data Management Approach
- Keep `events.yaml` format but load it as static data
- Implement server-side event filtering for upcoming/past events
- Preserve timezone logic for America/Chicago
- Maintain existing event card styling and structure

### 6. Key Technical Considerations
- Preserve existing SEO metadata and Open Graph tags
- Maintain current URL structure for SEO consistency
- Ensure Buttondown newsletter integration continues working
- Keep existing external integrations (Eventbrite, Cloudinary, social media)

### 7. Content Migration Priority
1. Core layout and navigation
2. Homepage with event listing and filtering
3. Static pages (About, Contact, FAQ, etc.)
4. Blog post system
5. Calendar page with full event history

### 8. Development Workflow
- Set up dev server with hot reloading
- Configure build process for static generation
- Test event filtering logic with current date scenarios
- Validate responsive design on mobile devices

This plan preserves all existing functionality while modernizing the architecture to SvelteKit, providing a solid foundation for Phase 1 dynamic features.

## Implementation Status - COMPLETED ✅

### Phase 1: Project Foundation (COMPLETED)
- [x] **Initialize SvelteKit project** - Created with minimal template and static adapter
- [x] **Configure static site generation** - `@sveltejs/adapter-static` configured with prerendering
- [x] **Set up directory structure** - Routes, lib, components, utils organized
- [x] **Install dependencies** - SvelteKit, static adapter, js-yaml for event data

### Phase 2: Styling System (COMPLETED)
- [x] **CSS Framework Decision** - Removed Tailwind/PostCSS complexity 
- [x] **Plain CSS Implementation** - Complete utility class system in pure CSS
- [x] **Original Design Preserved** - Rubik font, green/orange color scheme, proper spacing
- [x] **Responsive Design** - Mobile-first approach with media queries

### Phase 3: Content Migration (COMPLETED)
- [x] **Layout Component** - Main layout with navigation, footer, newsletter signup
- [x] **Event System** - YAML to JS conversion, date filtering, timezone handling (America/Chicago)
- [x] **Homepage** - Event listing with upcoming events display and filtering
- [x] **EventCard Component** - Reusable component for event display with images, dates, registration links
- [x] **Data Loading** - SvelteKit load functions for server-side data processing

### Phase 4: Build & Deployment (COMPLETED)
- [x] **Static Build** - Generates pure HTML files with prerendered content
- [x] **Error Handling** - 404 error handling for missing pages during prerendering  
- [x] **Performance Optimization** - 2.62 kB CSS bundle, optimized static assets
- [x] **Hydration Issues Fixed** - Resolved SSR/client mismatch problems

## Current Status: ✅ FULLY FUNCTIONAL

**✅ What Works:**
- Static site generation with full HTML prerendering
- Event system with upcoming/past filtering and proper timezone handling
- Homepage displays actual events from YAML data
- Responsive design matching original site appearance
- Newsletter integration with Buttondown
- Clean build process with no errors
- SEO metadata and Open Graph tags
- External link integrations (Eventbrite, Instagram)

### Phase 5: Static Pages Migration (COMPLETED)
- [x] **About Page** - Complete bio, community info, social media links
- [x] **Contact Page** - Netlify form integration, links to modeling/private events
- [x] **FAQ Page** - Comprehensive life drawing information and session details
- [x] **Code of Conduct Page** - Rules for models and artists, safety guidelines
- [x] **For Models Page** - Airtable form integration for model applications
- [x] **Private Events Page** - Airtable form integration for private bookings
- [x] **Calendar Page** - Event listing integration with existing event system
- [x] **Special Event Pages** - Expressive Charcoal Fundamentals, Portrait Sketching classes

### Phase 6: Blog System (COMPLETED)
- [x] **Blog Post Data Structure** - Created utilities for parsing front matter and content
- [x] **Dynamic Routes** - Implemented `/posts/[slug]` route with proper prerendering
- [x] **Blog Post Pages** - Individual blog post pages with full content and SEO metadata
- [x] **Blog Post Cards** - Homepage integration with styled blog post cards
- [x] **Content Migration** - Migrated "Celebrating One Year" blog post with full HTML content
- [x] **Filesystem-based Blog System** - Build-time post generation from markdown files in `src/posts/`
- [x] **Markdown Processing** - Proper markdown parsing using `marked` library with HTML output
- [x] **Custom Front Matter Support** - Handles custom `----` delimiter format from original site
- [x] **Build Integration** - Post generation runs automatically during build process

### Phase 7: NextEventBanner Component (COMPLETED)
- [x] **Component Creation** - Built NextEventBanner.svelte with event data integration
- [x] **Event Logic** - Shows next upcoming event with proper date formatting
- [x] **Layout Integration** - Positioned at top of all pages in main layout
- [x] **Design Match** - Exactly matches original green banner styling

**🚧 Next Steps (Future Phases):**
- [ ] Deploy to Netlify

## Technical Implementation Details

**Architecture:**
- SvelteKit with `@sveltejs/adapter-static`
- Pure CSS styling system (no external frameworks)  
- Server-side data loading with `+page.js` files
- Event data converted from YAML to JavaScript modules
- Build-time blog post generation from filesystem markdown
- Proper markdown parsing with `marked` library

**File Structure:**
```
appletondrawingclub-svelte/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte (main layout)
│   │   ├── +layout.js (prerender config)
│   │   ├── +page.svelte (homepage)
│   │   ├── +page.js (homepage data loading)
│   │   └── posts/[slug]/+page.svelte (dynamic blog posts)
│   ├── posts/ (markdown blog posts)
│   │   └── 2025-04-12-celebrating-one-year.md
│   ├── lib/
│   │   ├── data/
│   │   │   ├── events.js (converted from YAML)
│   │   │   └── posts.js (auto-generated from markdown)
│   │   ├── components/
│   │   │   ├── EventCard.svelte
│   │   │   ├── NextEventBanner.svelte
│   │   │   └── BlogPostCard.svelte
│   │   └── utils/
│   │       ├── events.js (filtering logic)
│   │       └── posts.js (blog utilities)
│   └── app.css (complete styling system)
├── scripts/
│   └── generate-posts.js (build-time markdown processing)
├── build/ (static output)
└── package.json (includes generate:posts build script)
```

**Build Output:** 
- Fully static HTML files
- 2.62 kB CSS bundle
- JavaScript for hydration and interactivity
- All external integrations preserved