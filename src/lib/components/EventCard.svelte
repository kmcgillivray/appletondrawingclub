<script lang="ts">
  import { formatEventDate } from '../utils/events';
  import type { Event } from '../types';

  let { event }: { event: Event } = $props();

  const formattedDate = formatEventDate(event.date);
  const isFreeEvent = event.price === 0;
  const priceString = isFreeEvent ? 'Free' : `$${event.price}`;
  const buttonText = `${priceString} – Reserve your spot`;
  const isExternalLink = event.url?.startsWith('http');
</script>

<li class="block shadow bg-white mb-2">
  <a 
    class="block no-underline hover:bg-gray-50 transition-colors text-green-600 hover:text-green-700" 
    href={event.url} 
    {...(isExternalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
  >
    {#if event.image_url}
      <img src={event.image_url} alt={event.title} class="w-full h-auto object-contain" />
    {/if}
    <div class="p-3">
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
      <button class="w-full cursor-pointer bg-green-700 p-2 text-white border-none rounded hover:bg-green-800">
        {buttonText}
      </button>
    </div>
  </a>
</li>