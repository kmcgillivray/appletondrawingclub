import { loadEvents, filterUpcomingEvents } from '$lib/utils/events.js';

export function load() {
  const events = loadEvents();
  const upcomingEvents = filterUpcomingEvents(events);
  const displayEvents = upcomingEvents.slice(0, 4); // Show max 4 upcoming events on homepage
  
  return {
    displayEvents
  };
}