<script lang="ts">
  import { formatEventDate } from '../utils/events';
  import type { Event } from '../types';

  let { event }: { event: Event } = $props();

  const formattedDate = formatEventDate(event.date);
  const isFreeEvent = event.price === 0;
  const isComingSoon = event.status === 'coming_soon';
  const priceString = isFreeEvent ? 'Free' : `$${event.price}`;
  const buttonText = isComingSoon ? 'Coming soon' : `${priceString} – Reserve your spot`;
</script>

{#if event.image_url}
  <img src={event.image_url} alt={event.title} class="w-full h-auto object-contain" />
{/if}
<div class="p-3">
  <div class="mb-2">
    {#if event.event_type === 'workshop'}
      <span class="px-2 py-1 bg-blue-100 text-blue-900 rounded-full text-sm">Workshop</span>
    {:else if event.event_type === 'portrait'}
      <span class="px-2 py-1 bg-purple-100 text-purple-900 rounded-full text-sm">Portrait Session</span>
    {:else  if event.event_type === 'figure_drawing'}
      <span class="px-2 py-1 bg-green-100 text-green-900 rounded-full text-sm">Figure Drawing</span>
    {:else}
      <span class="px-2 py-1 bg-gray-100 text-gray-900 rounded-full text-sm">{event.event_type}</span>
    {/if}
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
    class="w-full p-2 text-white border-none rounded {isComingSoon ? 'bg-gray-400 cursor-not-allowed' : 'cursor-pointer bg-green-700 hover:bg-green-800'}"
    disabled={isComingSoon}
  >
    {buttonText}
  </button>
</div>