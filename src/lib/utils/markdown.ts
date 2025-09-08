import { marked } from "marked";

// Configure marked with custom options
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // Enable GitHub Flavored Markdown
});

export function renderMarkdown(markdown: string) {
  if (!markdown) return "";
  const result = marked(markdown, { async: false});
  return result;
}
