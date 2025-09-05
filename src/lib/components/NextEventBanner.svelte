<script lang="ts">
  import { eventsData } from '$lib/data/events.js';
  import { filterUpcomingEvents } from '$lib/utils/events.js';

  const upcomingEvents = filterUpcomingEvents(eventsData.events);
  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

  function formatEventDate(dateString: string) {
    const [year, month, day] = dateString.split('-');
    const chicagoDateString = `${year}-${month}-${day}T12:00:00`;
    const dateObj = new Date(chicagoDateString);
    
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'America/Chicago'
    });
  }
</script>

{#if nextEvent}
  <div class="banner bg-green-900 text-white py-2 px-4 text-center text-sm">
    <span class="font-medium">
      Next Session: {nextEvent.title} - {formatEventDate(nextEvent.date)}, {nextEvent.time}
    </span>
    <a 
      href={nextEvent.url} 
      target={nextEvent.url.startsWith('http') ? '_blank' : undefined}
      class="ml-2"
    >
      Reserve your spot →
    </a>
  </div>
{/if}