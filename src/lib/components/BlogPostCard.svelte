<script>
  export let post;
</script>

<li class="block shadow bg-white mb-2">
  <a class="block no-underline hover:bg-gray-50 transition-colors text-green-600 hover:text-green-700" href="/posts/{post.slug}">
    <img
      src={post.imageUrl}
      alt={post.imageAlt}
      class="w-full h-48 object-cover"
    />
    <div class="p-3">
      <h3 class="pb-3 text-lg font-bold text-green-700">{post.title}</h3>
      <p class="text-gray-600 pb-3">By {post.author} • {post.date}</p>
    </div>
  </a>
</li>