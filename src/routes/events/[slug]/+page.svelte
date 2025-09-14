<script lang="ts">
  import RegistrationForm from '$lib/components/RegistrationForm.svelte';
  import { renderMarkdown } from '$lib/utils/markdown';
  import type { Event } from '$lib/types';
  import { formatEventDate } from '$lib/utils/events';

  // Get event data from load function
  export let data: { event: Event };
  
  const event = data.event;

  const formattedDate = formatEventDate(event.date);
  
  // Format location for display
  const formatLocation = (location: Event['location']) => {
    return `${location.name}, ${location.address.streetAddress}, ${location.address.addressLocality}, ${location.address.addressRegion}`;
  };
  
  const formattedLocation = formatLocation(event.location);
</script>

<svelte:head>
  <title>{event.title} | Appleton Drawing Club</title>
  <meta name="description" content="Join us for {event.title} on {formattedDate} at {formattedLocation}. ${event.price} - {event.summary}" />
  
  <!-- Open Graph tags -->
  <meta property="og:title" content="{event.title} | Appleton Drawing Club" />
  <meta property="og:description" content="Join us for {event.title} on {formattedDate} at {formattedLocation}. ${event.price} - {event.summary}" />
  <meta property="og:image" content="{event.image_url}" />
  <meta property="og:type" content="event" />
  
  <!-- Structured data for events -->
  {@html `<script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "startDate": `${event.date}T19:00:00`,
    "endDate": `${event.date}T21:00:00`,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": event.location.name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": event.location.address.streetAddress,
        "addressLocality": event.location.address.addressLocality,
        "addressRegion": event.location.address.addressRegion,
        "postalCode": event.location.address.postalCode
      }
    },
    "image": [event.image_url],
    "description": event.summary,
    "offers": {
      "@type": "Offer",
      "url": `https://appletondrawingclub.com/events/${event.id}`,
      "price": event.price.toString(),
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "organizer": {
      "@type": "Organization",
      "name": "Appleton Drawing Club",
      "url": "https://appletondrawingclub.com"
    },
    "performer": {
      "@type": "Person",
      "name": event.session_leader
    }
  }, null, 2)}
  </script>`}
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <!-- Hero Section -->
  <div class="mb-8 text-center">
    <div class="mb-3">
      {#if event.event_type === 'workshop'}
        <span class="px-2 py-1 bg-blue-100 text-blue-900 rounded-full">Workshop</span>
      {:else if event.event_type === 'portrait'}
        <span class="px-2 py-1 bg-purple-100 text-purple-900 rounded-full">Portrait Session</span>
      {:else  if event.event_type === 'figure_drawing'}
        <span class="px-2 py-1 bg-green-100 text-green-900 rounded-full">Figure Drawing</span>
      {:else}
        <span class="px-2 py-1 bg-gray-100 text-gray-900 rounded-full">{event.event_type}</span>
      {/if}
    </div>
    <h1 class="text-4xl md:text-5xl font-bold text-green-900 text-center mb-3">
      {event.title}
    </h1>
    
    <div class="text-center mb-6">
      <p class="text-2xl">{formattedDate} • {event.time}</p>
    </div>
    
    {#if event.image_url}
      <div class="mb-6">
        <img 
          src={event.image_url} 
          alt={event.title}
          class="w-full h-auto rounded-lg shadow-lg object-cover max-h-96"
        />
      </div>
    {/if}
  </div>

  <!-- Event Information Grid -->
  <div class="grid md:grid-cols-2 gap-6 mb-8">
    <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 class="text-2xl font-bold text-green-900 mb-4">Event Details</h2>
      <div class="space-y-3">
        <div>
          <strong class="text-gray-700">Event Type</strong>
          <div class="capitalize mt-1">
            {#if event.event_type === 'workshop'}
              <span class="px-2 py-1 bg-blue-100 text-blue-900 rounded-full">Workshop</span>
            {:else if event.event_type === 'portrait'}
              <span class="px-2 py-1 bg-purple-100 text-purple-900 rounded-full">Portrait Session</span>
            {:else  if event.event_type === 'figure_drawing'}
              <span class="px-2 py-1 bg-green-100 text-green-900 rounded-full">Figure Drawing</span>
            {:else}
              <span class="px-2 py-1 bg-gray-100 text-gray-900 rounded-full">{event.event_type}</span>
            {/if}
          </div>
        </div>
        <div>
          <strong class="text-gray-700">Date</strong>
          <div class="text-lg">{formattedDate}</div>
          <div class="text-lg">{event.time}</div>
        </div>
        {#if event.doors_open}
          <div>
            <strong class="text-gray-700">Doors Open</strong>
            <div class="text-lg">{event.doors_open}</div>
          </div>
        {/if}
        <div>
          <strong class="text-gray-700">Location</strong>
          <div class="text-lg">
            {event.location.name}<br />
            {event.location.address.streetAddress}<br />
            {event.location.address.addressLocality}, {event.location.address.addressRegion} {event.location.address.postalCode}<br />
            <a href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(event.location.address.streetAddress + ', ' + event.location.address.addressLocality + ', ' + event.location.address.addressRegion)} target="_blank" rel="noopener noreferrer">
              View on Google Maps
              </a>
          </div>
        </div>
        {#if event.model}
          <div>
            <strong class="text-gray-700">Model</strong>
            <div class="text-lg">{event.model}</div>
          </div>
        {/if}
        {#if event.session_leader}
          <div>
            <strong class="text-gray-700">Session Leader</strong>
            <div class="text-lg">{event.session_leader}</div>
          </div>
        {/if}
        {#if event.instructor}
          <div>
            <strong class="text-gray-700">Instructor</strong>
            <div class="text-lg">{event.instructor}</div>
          </div>
        {/if}
        {#if event.capacity}
          <div>
            <strong class="text-gray-700">Capacity</strong>
            <div class="text-lg">{event.capacity} artists</div>
          </div>
        {/if}
        <div>
          <strong class="text-gray-700">Price</strong>
          <div class="text-2xl font-bold text-green-700">
            {#if event.price === 0}
              Free event
            {:else}
              ${event.price}
            {/if}
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">    
      {#if event.status === 'coming_soon'}
        <div class="text-center py-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Coming Soon!</h2>
          <p class="text-gray-700 mb-6">This event is not yet open for registration. Please check back later!</p>
          <button
            class="bg-gray-400 text-white px-6 py-2 rounded-lg font-medium cursor-not-allowed"
            disabled
          >
            Coming Soon
          </button>
        </div>
      {/if}
      {#if event.status === 'completed'}
        <div class="text-center py-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Event Completed</h2>
          <p class="text-gray-700 mb-6">This event has already taken place. Please check out our upcoming events!</p>
          <a href="/events" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
            View Upcoming Events
          </a>
        </div>
      {/if}

      {#if event.status === 'registration_open'}
        <RegistrationForm eventId={event.id} eventPrice={event.price} eventTitle={event.title} />
      {/if}
    </div>
  </div>

  <!-- Description Section -->
  <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
    <h2 class="text-2xl font-bold text-green-900 mb-4">About This Event</h2>
    <div class="prose max-w-none text-gray-700">
      {@html renderMarkdown(event.description)}
    </div>
  </div>

  <!-- Special Notes -->
  {#if event.special_notes}
    <div class="bg-orange-50 border-l-4 border-orange-400 p-6 mb-8">
      <h3 class="text-lg font-bold text-orange-800 mb-2">Important Notes</h3>
      <p class="text-orange-700">{event.special_notes}</p>
    </div>
  {/if}

  <!-- Registration Section -->
  <div class="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
    {#if event.status === 'coming_soon'}
      <div class="text-center py-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Coming Soon!</h2>
        <p class="text-gray-700 mb-6">This event is not yet open for registration. Please check back later!</p>
        <button
          class="bg-gray-400 text-white px-6 py-2 rounded-lg font-medium cursor-not-allowed"
          disabled
        >
          Coming Soon
        </button>
      </div>
    {/if}
    {#if event.status === 'completed'}
      <div class="text-center py-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Event Completed</h2>
        <p class="text-gray-700 mb-6">This event has already taken place. Please check out our upcoming events!</p>
        <a href="/events" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
          View Upcoming Events
        </a>
      </div>
    {/if}

    {#if event.status === 'registration_open'}
      <RegistrationForm eventId={event.id} eventPrice={event.price} eventTitle={event.title} />
    {/if}
  </div>

  <div class="my-8 border-l-4 border-blue-400 p-6">
    <p class="text-blue-700 m-0">Interested in paid art modeling for a future session? <a href="/modeling">Sign up here!</a></p>
  </div>
</div>