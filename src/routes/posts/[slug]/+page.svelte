<script>
  export let data;
  const { post } = data;
</script>

<svelte:head>
  <title>{post.title} - Appleton Drawing Club</title>
  <meta name="description" content={post.excerpt} />
  <meta property="og:title" content={post.title} />
  <meta property="og:description" content={post.excerpt} />
  <meta property="og:image" content={post.imageUrl} />
</svelte:head>

<main>
  {@html post.content}
</main>