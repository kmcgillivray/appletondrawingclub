<script lang="ts">
  import { formatEventDate } from '../utils/events';
  import type { Event } from '../types';
  import EventTypeBadge from './EventTypeBadge.svelte';

  let { event }: { event: Event } = $props();

  const formattedDate = formatEventDate(event.date);
  const isFreeEvent = event.price === 0;
  const isComingSoon = event.status === 'coming_soon';
  const isCancelled = event.status === 'cancelled';
  const priceString = isFreeEvent ? 'Free' : `$${event.price}`;
  let buttonText = $state(`${priceString} – Reserve your spot`);
  if (isComingSoon) {
    buttonText = 'Coming Soon';
  } else if (isCancelled) {
    buttonText = 'Cancelled! Please join us for our next event';
  }
</script>

{#if event.image_url}
  <img src={event.image_url} alt={event.title} class="w-full h-auto object-contain" />
{/if}
<div class="p-3">
  <div class="mb-2">
    <EventTypeBadge eventType={event.event_type} size="sm" />
  </div>
  <h3 class="text-xl font-bold mb-2 pb-3 text-green-700">{event.title}</h3>
  <p class="text-gray-600 mb-2 pb-3">
    {formattedDate}<br />
    {event.time}<br />
    {event.location.name}
    {#if event.model}<br />Model: {event.model}{/if}
    {#if event.instructor}<br />Instructor: {event.instructor}{/if}
  </p>
  {#if event.special_notes}
    <p class="font-bold mb-2 pb-3">{event.special_notes}</p>
  {/if}
  <button
    class="w-full p-2 text-white border-none rounded {isComingSoon || isCancelled ? 'bg-gray-400 cursor-not-allowed' : 'cursor-pointer bg-green-700 hover:bg-green-800'}"
    disabled={isComingSoon || isCancelled}
  >
    {buttonText}
  </button>
</div>