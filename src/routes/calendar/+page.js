import { eventsData } from "$lib/data/events";
import { filterUpcomingEvents, filterPastEvents } from "$lib/utils/events.js";

export function load() {
  return {
    upcomingEvents: filterUpcomingEvents(eventsData.events),
    pastEvents: filterPastEvents(eventsData.events),
  };
}
