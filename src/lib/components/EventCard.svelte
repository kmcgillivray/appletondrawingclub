<script lang="ts">
  import EventCardBody from './EventCardBody.svelte';
  import type { Event } from '../types';

  let { event }: { event: Event } = $props();

  const isComingSoon = event.status === 'coming_soon';
  const isExternalLink = event.url?.startsWith('http');
</script>

<li class="block shadow bg-white mb-2">
  {#if isComingSoon}
    <div class="block">
      <EventCardBody {event} />
    </div>
  {:else}
    <a
      class="block no-underline hover:bg-gray-50 transition-colors text-green-600 hover:text-green-700"
      href={event.url}
      {...(isExternalLink ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <EventCardBody {event} />
    </a>
  {/if}
</li>