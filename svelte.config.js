import adapter from "@sveltejs/adapter-netlify";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    prerender: {
      handleHttpError: ({ message }) => {
        throw new Error(message);
      },
      handleUnseenRoutes: "warn",
    },
  },
};

export default config;
