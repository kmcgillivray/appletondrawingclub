<script>
  import EventCard from '$lib/components/EventCard.svelte';
  import BlogPostCard from '$lib/components/BlogPostCard.svelte';
  import { blogPosts } from '$lib/utils/posts.js';
  
  let { data } = $props();
  let { displayEvents } = data;
</script>

<svelte:head>
  <title>Home | Appleton Drawing Club</title>
</svelte:head>

<div class="mb-4 p-4 max-w-5xl mx-auto">
  <div class="max-w-prose mx-auto">
    <h1 class="headline">
      A friendly, local life drawing community
    </h1>
  </div>
  <img
    src="https://res.cloudinary.com/db5mnmxzn/image/upload/c_pad,w_1000/v1745845059/ADC_Portrait_20250423_023_b50vsz.webp"
    alt="A group of artists drawing portraits of a model."
  />
  
  <div class="text-center mt-6 px-3 mx-auto">
    <p class="text-2xl mb-2 pb-3">Join 100+ artists of all skill levels in our welcoming community</p>
    <p class="text-2xl pb-3">Classic figure drawing • Special themed events & workshops • All skill levels welcome</p>
  </div>
</div>

<section class="mx-auto my-8 px-4 max-w-prose">
  <h2 id="events" class="pb-3 text-xl font-bold text-green-700">Upcoming Events</h2>
  {#if displayEvents.length > 0}
    <ul class="grid md:grid-cols-2 gap-4 list-none">
      {#each displayEvents as event (event.url)}
        <EventCard {event} />
      {/each}
    </ul>
  {:else}
    <p class="pb-3">No upcoming events scheduled yet.</p>
  {/if}
  
  <p class="text-center mt-4 mb-2 text-gray-600 italic pb-3">
    Fall event schedule coming soon! 
    <a href="https://buttondown.com/appletondrawingclub" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">
      Sign up for our newsletter
    </a> 
    to be notified when it's available.
  </p>
  <p class="text-center pb-3">
    <a href="/calendar" class="text-blue-600 hover:text-blue-800 underline">View full calendar →</a>
  </p>
</section>

<section class="mx-auto my-8 px-4 max-w-prose">
  <h2 class="pt-3 pb-3 text-xl font-bold text-green-700">Blog posts & inspiration</h2>

  <ul class="grid md:grid-cols-1 gap-4 list-none">
    {#each blogPosts as post}
      <BlogPostCard {post} />
    {/each}
  </ul>
</section>
