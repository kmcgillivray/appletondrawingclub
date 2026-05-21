import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sentrySvelteKit({
        org: "appleton-drawing-club",
        project: "javascript-sveltekit"
    }), tailwindcss(), sveltekit()]
});
