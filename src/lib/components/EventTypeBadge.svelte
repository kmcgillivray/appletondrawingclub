<script lang="ts">
  import Badge from './Badge.svelte';
  import type { Event } from '../types';

  let {
    eventType,
    size = 'md'
  }: {
    eventType: Event['event_type'];
    size?: 'sm' | 'md' | 'lg';
  } = $props();

  const eventTypeConfig = {
    workshop: { variant: 'blue' as const, text: 'Workshop' },
    portrait: { variant: 'purple' as const, text: 'Portrait Session' },
    figure_drawing: { variant: 'green' as const, text: 'Figure Drawing' },
    special_event: { variant: 'yellow' as const, text: 'Special Event' }
  };

  const config = eventTypeConfig[eventType] || { variant: 'gray' as const, text: eventType };
</script>

<Badge variant={config.variant} {size}>
  {config.text}
</Badge>