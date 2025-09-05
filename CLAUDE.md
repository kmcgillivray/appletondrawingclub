# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (includes post generation)
- `npm run preview` - Preview production build
- `npm run generate:posts` - Generate blog post data from markdown files
- `npm run prepare` - Sync SvelteKit (runs on install)

## Architecture Overview

This is a **SvelteKit static site** for the Appleton Drawing Club, configured for static site generation using `@sveltejs/adapter-static`. The site features:

### Content Management System
- **Blog posts** are stored as markdown files in `src/posts/` with custom front matter format using `----` delimiter
- **Events** are managed in `src/lib/data/events.js` as a large JavaScript object
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

### Styling & Assets
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no separate config file)
- **Cloudinary** for image hosting and transformation
- **Custom CSS** in `src/app.css` for additional styling

### Key Files to Understand
- `scripts/generate-posts.js` - Post generation logic with custom parsing
- `src/lib/data/events.js` - All event data with detailed structure
- `src/lib/utils/events.js` - Event filtering and utility functions
- `src/routes/posts/[slug]/+page.js` - Dynamic post loading with prerendering entries
- `svelte.config.js` - Static adapter configuration with 404 handling

### Build Process
The build process requires generating posts before building (`npm run generate:posts && vite build`), ensuring all blog post data is available for static generation.