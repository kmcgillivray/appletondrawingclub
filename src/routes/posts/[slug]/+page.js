import { findBlogPostBySlug, getAllBlogPostSlugs } from '$lib/utils/posts.js';
import { error } from '@sveltejs/kit';

export function load({ params }) {
    const post = findBlogPostBySlug(params.slug);
    
    if (!post) {
        throw error(404, 'Post not found');
    }
    
    return {
        post
    };
}

export function entries() {
    return getAllBlogPostSlugs().map(slug => ({
        slug
    }));
}