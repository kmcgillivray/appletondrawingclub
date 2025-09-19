<script>
	import '../app.css';
	import NextEventBanner from '$lib/components/NextEventBanner.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>Appleton Drawing Club</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="description" content="Friendly, local life drawing in Appleton, WI">
	<meta name="keywords" content="Appleton Drawing Club, life drawing, figure drawing, drawing, art, Appleton, Wisconsin, Fox Cities, drawing club, artist, model, modeling, life model, figure model, art model, artist model, drawing model, Appleton Drawing Club, life drawing, figure drawing, drawing">
	<meta name="author" content="Appleton Drawing Club">
</svelte:head>

<NextEventBanner />

<header class="mx-auto my-8 px-4 max-w-prose">
	<h1 class="pb-3 text-2xl font-bold text-green-700"><a href="/" class="no-underline">Appleton Drawing Club</a></h1>
	<nav class="py-3 mb-3">
		<ul class="ml-0 flex flex-wrap gap-5 text-lg list-none">
			<li class="mb-0"><a href="/calendar" class="text-green-600 hover:text-green-700">Events</a></li>
			<li class="mb-0"><a href="/modeling" class="text-green-600 hover:text-green-700">For models</a></li>
			<li class="mb-0"><a href="/faq" class="text-green-600 hover:text-green-700">FAQs</a></li>
			<li class="mb-0"><a href="/about" class="text-green-600 hover:text-green-700">About</a></li>
			<li class="mb-0"><a href="/contact" class="text-green-600 hover:text-green-700">Contact</a></li>
		</ul>
	</nav>
</header>

<main>
	{@render children?.()}
</main>

<section class="mx-auto my-8 px-4 max-w-prose">
	<h2 class="pb-3 text-xl font-bold text-green-700">About Appleton Drawing Club</h2>
	<p class="pb-3">Appleton Drawing Club is a group of artists who meet regularly to draw from life. We welcome artists of all skill levels and backgrounds. We are dedicated to providing a safe and respectful environment for models and artists alike.</p>
	<p class="pb-3"><a href="/about" class="text-green-600 underline hover:text-green-700">Read more about Appleton Drawing Club</a></p>
	<p class="pb-3"><a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/appletondrawingclub/" class="text-green-600 underline hover:text-green-700">Follow Appleton Drawing Club on Instagram</a></p>
</section>

<section class="mx-auto my-8 px-4 max-w-prose">
	<h2 class="pb-3 text-xl font-bold text-green-700">Newsletter</h2>
	<p class="pb-3">Sign up for our newsletter to be notified about upcoming events and local drawing news.</p>
	<!-- TODO: Add NewsletterForm component -->
	<form
		action="https://buttondown.email/api/emails/embed-subscribe/appletondrawingclub"
		method="post"
		target="popupwindow"
		onsubmit={() => window.open('https://buttondown.email/appletondrawingclub', 'popupwindow')}
		class="embeddable-buttondown-form"
	>
		<div class="pb-3">
			<label for="bd-email" class="pb-2 font-bold text-green-700 block">Enter your email</label>
			<input type="email" name="email" id="bd-email" class="border border-gray-300 bg-white w-full font-normal text-black rounded px-3 py-2" />
		</div>
		<button type="submit" class="cursor-pointer bg-green-700 p-2 text-white border-none rounded hover:bg-green-800">Subscribe</button>
	</form>
</section>

<footer class="mx-auto my-8 px-4 max-w-prose text-center">
	<nav class="py-3 mb-3">
		<ul class="ml-0 md:flex gap-3 list-none justify-center">
			<li class="mb-2"><a href="/calendar" class="text-green-600 underline hover:text-green-700">Events</a></li>
			<li class="mb-2"><a href="/modeling" class="text-green-600 underline hover:text-green-700">For models</a></li>
			<li class="mb-2"><a href="/faq" class="text-green-600 underline hover:text-green-700">FAQs</a></li>
			<li class="mb-2"><a href="/code-of-conduct" class="text-green-600 underline hover:text-green-700">Code of conduct</a></li>
			<li class="mb-2"><a href="/about" class="text-green-600 underline hover:text-green-700">About</a></li>
			<li class="mb-2"><a href="/contact" class="text-green-600 underline hover:text-green-700">Contact</a></li>
		</ul>
	</nav>
	<p class="text-xl font-caveat">Made with ♥️ and charcoal in Appleton, WI</p>
</footer>
