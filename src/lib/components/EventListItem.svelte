<script>
  import { formatEventDate } from '../utils/events.js';

  let { event } = $props();

  let formattedDate = $derived(formatEventDate(event.date));
  let specialNotesHtml = $derived(event.special_notes ? `<p><strong>${event.special_notes}</strong></p>` : '');
  let priceText = $derived(event.price || 'Details and registration');
  let buttonText = $derived(event.price ? `${event.price} – Reserve your spot` : 'Details and registration');
</script>

<li class="mb-2">
  {formattedDate}<br>{event.title}
</li>