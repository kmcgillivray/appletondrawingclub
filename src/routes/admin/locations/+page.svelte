<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<div class="max-width-prose mx-auto p-4">
  <h3>Locations</h3>
  <ul>
    {#each data.locations as location}
      <li>{location.name}</li>
    {/each}
  </ul>
</div>