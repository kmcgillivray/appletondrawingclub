import { Parser, HtmlRenderer } from 'commonmark';
import fs from 'fs';
import path from 'path';

function writePosts() {
  // Read all markdown files in the src/posts directory and write them to the public/posts directory as html
  const parser = new Parser();
  const renderer = new HtmlRenderer();
  const postsDir = path.resolve('src/posts');
  const publicDir = path.resolve('public/posts');
  const files = fs.readdirSync(postsDir);
  
  // Load the template file HTML from src/template.html
  const template = fs.readFileSync(path.resolve('src/template.html'), 'utf8');
  
  // Create the public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  for (const file of files) {
    console.log(`Building ${file}...`);
    const newDirectory = path.join(publicDir, file.replace('.md', ''));
    if (!fs.existsSync(newDirectory)) {
        fs.mkdirSync(newDirectory);
    }
    const markdown = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const ast = parser.parse(markdown);
    const html = renderer.render(ast);
    // Replace {{ content }} in the template with the HTML content
    const newHtml = template.replace('{{ content }}', html);
    fs.writeFileSync(path.join(publicDir, file.replace('.md', ''), 'index.html'), newHtml);
  }
  
  console.log('Done writing posts!');
}

function writeIndex() {
  // Read the src/pages/index.html file and write it to the public directory with the template
  const template = fs.readFileSync(path.resolve('src/template.html'), 'utf8');
  const indexHtml = fs.readFileSync(path.resolve('src/index.html'), 'utf8');
  const newHtml = template.replace('{{ content }}', indexHtml);

  // create public directory if it doesn't exist
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(path.resolve('public/index.html'), newHtml);
  console.log('Done writing index!');
}

function writePages() {
  // Read all HTML files in the src/pages directory and write them to the public directory with the template
  const template = fs.readFileSync(path.resolve('src/template.html'), 'utf8');
  const pagesDir = path.resolve('src/pages');
  const publicDir = path.resolve('public');
  const files = fs.readdirSync(pagesDir);
  
  for (const file of files) {
    console.log(`Building ${file}...`);
    const newDirectory = path.join(publicDir, file.replace('.html', ''));
    if (!fs.existsSync(newDirectory)) {
      fs.mkdirSync(newDirectory);
    }
    const html = fs.readFileSync(path.join(pagesDir, file), 'utf8');
    // Replace {{ content }} in the template with the HTML content
    const newHtml = template.replace('{{ content }}', html);
    fs.writeFileSync(path.join(newDirectory, 'index.html'), newHtml);
  }
  
  console.log('Done writing pages!');
}

// TODO: Delete the public directory before writing new files
writeIndex();
writePages();
// writePosts();
