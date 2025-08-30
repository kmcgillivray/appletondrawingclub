# Appleton Drawing Club Website

A static site generator for the Appleton Drawing Club website, built with Node.js and deployed on Netlify.

## Development Commands

- **Development mode**: `npm run dev` - Watches Tailwind CSS for changes and rebuilds styles
- **Build**: `npm run build` - Builds the static site and compiles CSS
  - Runs `node build.js` to generate HTML from templates and markdown
  - Compiles Tailwind CSS from `src/main.css` to `public/styles/main.css`

## Architecture

### Static Site Generation
Custom Node.js build script (`build.js`) processes:
- Single HTML template (`src/template.html`) with placeholder replacement
- Markdown blog posts from `src/posts/`
- HTML pages from `src/pages/`
- Event data from `src/events.yaml`

### Build Process
1. **Index page**: Processes homepage with upcoming events and next event banner
2. **Static pages**: Processes all HTML files in `src/pages/`, with special handling for calendar page
3. **Blog posts**: Converts markdown files to HTML and applies template

### Event System
Events are managed through `src/events.yaml` with automatic date filtering using America/Chicago timezone. Generates:
- Upcoming events lists with registration buttons
- Past events archives  
- Next event banner for homepage
- Calendar page with full event listings

### Styling
- Tailwind CSS with configuration in `tailwind.config.js`
- Styles compiled from `src/main.css` to `public/styles/main.css`

### Serverless Functions
Netlify Functions in `netlify/functions/` for event integrations (TypeScript .mts files)

## File Structure

```
src/
├── events.yaml          # Event data source
├── template.html        # Base HTML template
├── index.html          # Homepage content
├── main.css            # Tailwind CSS source
├── pages/              # Static HTML pages
└── posts/              # Markdown blog posts

public/                 # Generated output (git ignored)
netlify/functions/      # Serverless functions
```

## Notes

- Front matter parsing uses custom implementation with `----` delimiter
- All dates use America/Chicago timezone
- Generated files in `public/` are ignored by git