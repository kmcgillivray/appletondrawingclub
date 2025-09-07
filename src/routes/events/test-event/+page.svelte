<script lang="ts">
  import type { Event } from '$lib/types';
  import RegistrationForm from '$lib/components/RegistrationForm.svelte';
  
  // Test event data - hardcoded for now, will be replaced with dynamic data later
  const event: Event = {
    id: 'test-event',
    title: 'Mixed Pose Life Drawing',
    date: '2024-03-14',
    time: '7:00-9:00PM',
    doors_open: '6:30PM',
    location: {
      name: 'The Photo Opp Studio',
      address: {
        streetAddress: '123 Main St',
        addressLocality: 'Appleton',
        addressRegion: 'WI',
        postalCode: '54911'
      }
    },
    model: 'Professional model',
    session_leader: 'Kevin McGillivray',
    price: 15.00,
    capacity: 20,
    event_type: 'figure_drawing',
    special_notes: 'Bring your own drawing materials',
    description: 'Join us for an evening of life drawing with mixed poses ranging from quick gesture sketches to longer studies. This is a perfect opportunity for artists of all skill levels to practice their figure drawing techniques in a supportive, welcoming environment.',
    image_url: 'https://res.cloudinary.com/db5mnmxzn/image/upload/c_fill,g_center,h_750,w_750/v1703199034/IMG_8034_ab2tov.jpg'
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formattedDate: string = formatDate(event.date);
  
  // Format location for display
  const formatLocation = (location: Event['location']): string => {
    return `${location.name}, ${location.address.streetAddress}, ${location.address.addressLocality}, ${location.address.addressRegion}`;
  };
  
  const formattedLocation: string = formatLocation(event.location);
</script>

<svelte:head>
  <title>{event.title} | Appleton Drawing Club</title>
  <meta name="description" content="Join us for {event.title} on {formattedDate} at {formattedLocation}. ${event.price} - {event.description}" />
  
  <!-- Open Graph tags -->
  <meta property="og:title" content="{event.title} | Appleton Drawing Club" />
  <meta property="og:description" content="Join us for {event.title} on {formattedDate} at {formattedLocation}. ${event.price}" />
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
    "description": event.description,
    "offers": {
      "@type": "Offer",
      "url": "https://appletondrawingclub.com/events/test-event",
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
  <div class="mb-8">
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
      <h2 class="text-xl font-bold text-green-900 mb-4">Event Details</h2>
      <div class="space-y-3">
        <div>
          <strong class="text-gray-700">Date</strong>
          <div class="text-lg">{formattedDate}</div>
        </div>
        <div>
          <strong class="text-gray-700">Time</strong>
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
          <div class="text-lg">{formattedLocation}</div>
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
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 class="text-xl font-bold text-green-900 mb-4">Pricing & Registration</h2>
      <div class="space-y-3 mb-6">
        <div>
          <strong class="text-gray-700">Price</strong>
          <div class="text-2xl font-bold text-green-700">${event.price}</div>
        </div>
        <div>
          <strong class="text-gray-700">Capacity</strong>
          <div class="text-lg">{event.capacity} artists</div>
        </div>
        <div>
          <strong class="text-gray-700">Event Type</strong>
          <div class="text-lg capitalize">{event.event_type.replace('_', ' ')}</div>
        </div>
      </div>
      
      <!-- Registration Form -->
      <div class="pt-4 border-t border-gray-200">
        <RegistrationForm eventId={event.id} eventPrice={event.price} />
      </div>
    </div>
  </div>

  <!-- Description Section -->
  <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
    <h2 class="text-xl font-bold text-green-900 mb-4">About This Event</h2>
    <div class="prose max-w-none">
      <p class="text-gray-700 leading-relaxed text-lg">{event.description}</p>
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
  <div class="mt-8">
    <RegistrationForm eventId={event.id} eventPrice={event.price} />
  </div>
</div>