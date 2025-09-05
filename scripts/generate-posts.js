import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parses front matter and content from blog post markdown
 * Supports the custom ---- delimiter format used in the original site
 */
function parseFrontMatterAndContent(markdown) {
  const [frontMatter, ...contentParts] = markdown.split('----');
  const content = contentParts.join('----').trim();
  
  const frontMatterData = {};
  frontMatter.split('\n').forEach(line => {
    const [key, value] = line.split(':');
    if (key && value) {
      frontMatterData[key.trim()] = value.trim();
    }
  });
  
  return { frontMatterData, content };
}

/**
 * Extracts slug from filename (e.g. "2025-04-12-celebrating-one-year.md" -> "2025-04-12-celebrating-one-year")
 */
function extractSlugFromFilename(filename) {
  return filename.replace('.md', '');
}

/**
 * Extracts metadata from blog post content for preview cards
 */
function extractPostMetadata(content) {
  // Extract first image for the card
  const imageMatch = content.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/);
  const imageUrl = imageMatch ? imageMatch[1] : null;
  const imageAlt = imageMatch ? imageMatch[2] : '';
  
  // Extract first paragraph for excerpt (remove HTML tags)
  const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const firstSentence = textContent.split(/[.!?]/)[0];
  const excerpt = firstSentence.length > 150 ? 
    firstSentence.substring(0, 150) + '...' : 
    firstSentence + '.';

  return { imageUrl, imageAlt, excerpt };
}

/**
 * Parse date from filename and format it nicely
 */
function formatDateFromFilename(filename) {
  const dateMatch = filename.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) return 'Unknown Date';
  
  const [, year, month, day] = dateMatch;
  const date = new Date(year, parseInt(month) - 1, day);
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Process mixed HTML/Markdown content
 * The original posts contain both HTML and Markdown, so we process the markdown parts with marked
 */
function processContent(content) {
  // Configure marked to handle our specific needs
  marked.setOptions({
    breaks: true,
    gfm: true
  });
  
  // Since the content is mixed HTML/Markdown, we need to be careful
  // Let's process it with marked and then clean up any issues
  const processedContent = marked(content);
  
  // Post-process to add our custom classes for lists
  return processedContent.replace(/<ul>/g, '<ul class="bullet">');
}

/**
 * Generate posts data from filesystem
 */
function generatePosts() {
  const postsDir = path.resolve(__dirname, '../src/posts');
  const outputFile = path.resolve(__dirname, '../src/lib/data/posts.js');
  
  if (!fs.existsSync(postsDir)) {
    console.warn('Posts directory not found:', postsDir);
    return;
  }
  
  const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
  
  const posts = files.map(file => {
    const filePath = path.join(postsDir, file);
    const markdown = fs.readFileSync(filePath, 'utf8');
    const { frontMatterData, content } = parseFrontMatterAndContent(markdown);
    
    // Process the mixed HTML/Markdown content
    const processedContent = processContent(content);
    const { imageUrl, imageAlt, excerpt } = extractPostMetadata(processedContent);
    
    const slug = extractSlugFromFilename(file);
    const formattedDate = formatDateFromFilename(file);
    
    return {
      slug,
      title: frontMatterData.title || 'Untitled Post',
      date: formattedDate,
      author: 'Kevin McGillivray', // Default author for all posts
      excerpt,
      imageUrl: imageUrl || 'https://res.cloudinary.com/db5mnmxzn/image/upload/c_fill,g_center,h_350,w_750/v1742585378/250226_ADCWildlifeDrawing_M4W_012_teyyz9.jpg', // Fallback image
      imageAlt: imageAlt || 'Appleton Drawing Club',
      content: processedContent
    };
  });
  
  // Sort posts by date (newest first)
  const sortedPosts = posts.sort((a, b) => {
    const dateA = new Date(a.slug.substring(0, 10));
    const dateB = new Date(b.slug.substring(0, 10));
    return dateB - dateA;
  });
  
  // Generate the output file
  const output = `// Auto-generated file - do not edit manually
// Generated on ${new Date().toISOString()}

export const blogPosts = ${JSON.stringify(sortedPosts, null, 2)};

/**
 * Find a specific blog post by slug
 */
export function findBlogPostBySlug(slug) {
  return blogPosts.find(post => post.slug === slug);
}

/**
 * Get all blog post slugs for prerendering
 */
export function getAllBlogPostSlugs() {
  return blogPosts.map(post => post.slug);
}
`;
  
  // Ensure the data directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputFile, output);
  console.log(`Generated ${posts.length} blog posts to ${outputFile}`);
}

// Run the generator
generatePosts();