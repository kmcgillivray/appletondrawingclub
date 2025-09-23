<script lang="ts">
	let { children } = $props();
</script>

<div>
  <h2>This is a test</h2>
  {@render children?.()}
</div>