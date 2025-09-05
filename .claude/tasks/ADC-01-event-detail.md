# ADC-01: Event Detail Page

## User Story
As a user, I want to see an event detail page with a full description of an event so that I can understand what the event offers and decide if I want to attend.

## Acceptance Criteria
- [ ] User can navigate to `/events/test-event` 
- [ ] Page displays event title prominently
- [ ] Page shows event date and time clearly
- [ ] Page shows event location with full address
- [ ] Page displays event pricing information
- [ ] Page includes detailed event description
- [ ] Page shows event type (figure drawing, portrait, workshop, etc.)
- [ ] Page includes event image if available
- [ ] Page shows any special notes or requirements
- [ ] Page shows model/instructor information when applicable
- [ ] Page is fully responsive on mobile and desktop
- [ ] Page follows existing site design patterns

## Prerequisites
- SvelteKit project is set up and running
- Basic routing is working

## Implementation Steps

### 1. Create Event Route Structure
Create the route file at `src/routes/events/test-event/+page.svelte`

### 2. Define Test Event Data
Create hardcoded event data with realistic information:
- Title: "Mixed Pose Life Drawing"
- Date: Next Thursday 
- Time: "7:00-9:00PM"
- Location: "The Photo Opp Studio, 123 Main St, Appleton, WI"
- Price: $15
- Description: Detailed description of what to expect
- Event type: "figure_drawing"
- Model information
- Special notes about materials, what to bring, etc.

### 3. Create Event Detail Component
Build the page layout with:
- Hero section with title and key details
- Event information grid (date, time, location, price)
- Full description section
- Event image placeholder or actual image
- Call-to-action area for registration (placeholder for now)

### 4. Style with Tailwind CSS
Apply consistent styling that matches the existing site:
- Use existing color scheme (green accents)
- Ensure mobile-first responsive design
- Add proper typography hierarchy
- Include hover states and visual feedback

### 5. Add SEO and Meta Tags
- Set page title and description
- Add Open Graph tags for social sharing
- Include structured data for events

## Technical Requirements
- Use SvelteKit's static prerendering for this page
- Follow existing component patterns from the site
- Ensure page loads quickly with optimized images
- Include proper error handling for missing data

## Testing Criteria
- [ ] Page loads without errors at `/events/test-event`
- [ ] All event information displays correctly
- [ ] Page is fully responsive across devices
- [ ] Links and navigation work properly
- [ ] SEO tags are properly set
- [ ] Page follows accessibility best practices
- [ ] Design is consistent with existing site

## Files Created/Modified
- `src/routes/events/test-event/+page.svelte` - Event detail page
- Any shared components if needed for reusable elements

## Next Steps
After completing this task, proceed to **ADC-02** to add pay-at-door registration functionality to this event page.