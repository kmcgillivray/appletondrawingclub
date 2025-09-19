<script>
  import EventCard from '$lib/components/EventCard.svelte';
  import BlogPostCard from '$lib/components/BlogPostCard.svelte';
  import { blogPosts } from '$lib/utils/posts.js';
  
  let { data } = $props();
  let { displayEvents } = data;
</script>

<svelte:head>
  <title>Home | Appleton Drawing Club</title>
  <meta property="og:image" content="https://res.cloudinary.com/db5mnmxzn/image/upload/c_fill,g_auto,h_450,w_970/v1725293285/IMG_0262_aaxson.jpg">
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
  <h2 id="events" class="pb-4 text-3xl font-bold text-green-700">Upcoming events</h2>
  {#if displayEvents.length > 0}
    <ul class="ml-0 grid md:grid-cols-2 gap-4 list-none">
      {#each displayEvents as event (event.id)}
        <EventCard {event} />
      {/each}
    </ul>
  {:else}
    <p class="pb-3">No upcoming events scheduled yet.</p>
  {/if}
  
  <div class="text-center my-10 mx-auto">
    <a href="/calendar"
      class="w-full no-underline py-3 px-4 text-white border-none rounded cursor-pointer bg-green-700 hover:bg-green-800"
    >
      View full calendar →
    </a>
  </div>
</section>

<section class="mx-auto my-8 px-4 max-w-prose">
  <h2 class="pt-3 pb-4 text-3xl font-bold text-green-700">Blog posts & inspiration</h2>

  <ul class="ml-0 grid md:grid-cols-1 gap-4 list-none">
    {#each blogPosts as post}
      <BlogPostCard {post} />
    {/each}
  </ul>
</section>
