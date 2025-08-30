# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Workflow

- Always run `npm run build` after making changes to verify the site builds correctly
- When modifying event data, edit `src/events.yaml` and test both upcoming and past event filtering
- For styling changes, use `npm run dev` to watch for changes while developing

## Code Patterns

### Event Data Structure
When working with events in `src/events.yaml`, maintain the existing structure:
- Use `YYYY-MM-DD` date format
- Include all required fields: `title`, `date`, `time`, `location`, `url`
- Optional fields: `model`, `instructor`, `special_notes`, `price`, `image_url`

### Template System
The site uses a simple placeholder replacement system in `src/template.html`:
- `{{ content }}` - Main page content
- `{{ title }}` - Page title
- `{{ next_event_banner }}` - Event banner (homepage only)

### Front Matter Format
Blog posts and pages use custom front matter with `----` delimiter (not standard `---`):
```
title: Page Title
----
Content goes here...
```

## Testing Considerations

- Test event filtering logic with dates around current date
- Verify timezone handling (America/Chicago) for event dates
- Check responsive layout on mobile devices
- Validate external links to Eventbrite registration pages

## Common Tasks

- **Adding events**: Edit `src/events.yaml`, run build to test
- **New blog posts**: Create markdown file in `src/posts/` with front matter
- **Page updates**: Edit HTML files in `src/pages/` or `src/index.html`
- **Style changes**: Modify `src/main.css` and run `npm run dev`