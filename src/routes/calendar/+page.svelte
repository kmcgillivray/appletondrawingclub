<script>
  import EventCard from '$lib/components/EventCard.svelte';
  import EventListItem from '$lib/components/EventListItem.svelte';
  
  export let data;
</script>

<svelte:head>
  <title>Calendar - Appleton Drawing Club</title>
  <meta name="description" content="View upcoming and past life drawing events and sessions at Appleton Drawing Club in Appleton, Wisconsin." />
</svelte:head>

<section class="container">
  <h1 class="text-5xl text-center mb-4">Calendar</h1>
  
  {#if data.upcomingEvents.length > 0}
    <h2>Upcoming Events</h2>
    <ul class="grid md:grid-cols-2 gap-4 list-none">
      {#each data.upcomingEvents as event}
        <EventCard {event} />
      {/each}
    </ul>
  {/if}
  
  {#if data.pastEvents.length > 0}
    <h2 class="mt-4">Past Events</h2>
    <ul>
      {#each data.pastEvents as event}
        <EventListItem {event} />
      {/each}
    </ul>
  {/if}
</section>