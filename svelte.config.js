import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: false
		}),
		prerender: {
			handleHttpError: ({ message }) => {
				// Ignore 404s for pages that don't exist yet
				if (message.includes('404')) {
					return;
				}
				throw new Error(message);
			}
		}
	}
};

export default config;
