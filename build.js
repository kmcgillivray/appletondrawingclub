import { Parser, HtmlRenderer } from 'commonmark';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

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
    const { frontMatterData, content } = getFrontMatterAndContent(markdown);
    const ast = parser.parse(content);
    const html = renderer.render(ast);
    // Replace {{ content }} in the template with the HTML content
    const newHtml = template.replace('{{ content }}', html).replace('{{ title }}', frontMatterData.title || 'Untitled');
    fs.writeFileSync(path.join(publicDir, file.replace('.md', ''), 'index.html'), newHtml);
  }
  
  console.log('Done writing posts!');
}

function writeIndex() {
  // Read the src/pages/index.html file and write it to the public directory with the template
  const template = fs.readFileSync(path.resolve('src/template.html'), 'utf8');
  const indexHtml = fs.readFileSync(path.resolve('src/index.html'), 'utf8');
  
  // Load events and generate upcoming events HTML
  const events = loadEvents();
  const upcomingEvents = filterUpcomingEvents(events);
  const upcomingEventsHtml = upcomingEvents
    .slice(0, 8) // Show max 4 upcoming events on homepage
    .map(generateEventCardHtml)
    .join('');
  
  // Replace event placeholders in the index HTML
  const processedIndexHtml = indexHtml.replace('{{ upcoming_events }}', upcomingEventsHtml);
  
  const newHtml = template.replace('{{ content }}', processedIndexHtml).replace('{{ title }}', 'Home');

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
  
  // Load events data for calendar page
  const events = loadEvents();
  
  for (const file of files) {
    console.log(`Building ${file}...`);
    const newDirectory = path.join(publicDir, file.replace('.html', ''));
    if (!fs.existsSync(newDirectory)) {
      fs.mkdirSync(newDirectory);
    }
    
    let html = fs.readFileSync(path.join(pagesDir, file), 'utf8');
    const { frontMatterData, content } = getFrontMatterAndContent(html);
    
    let processedContent = content;
    
    // Special handling for calendar page
    if (file === 'calendar.html') {
      const upcomingEvents = filterUpcomingEvents(events);
      const pastEvents = filterPastEvents(events);
      
      const upcomingEventsHtml = upcomingEvents.length > 0 ? 
        `<h2>Upcoming Events</h2>
         <ul class="grid md:grid-cols-2 gap-4">
           ${upcomingEvents.map(generateEventCardHtml).join('')}
         </ul>` : '<h2>Upcoming Events</h2><p>No upcoming events scheduled yet.</p>';
      
      const pastEventsHtml = pastEvents.length > 0 ?
        `<h2 class="pt-3">Past Events</h2>
         <ul class="grid md:grid-cols-1 gap-2">
           ${pastEvents.map(event => generatePastEventHtml(event)).join('')}
         </ul>` : '';
      
      processedContent = processedContent
        .replace('{{ upcoming_events }}', upcomingEventsHtml)
        .replace('{{ past_events }}', pastEventsHtml);
    }
    
    // Replace {{ content }} in the template with the HTML content
    const newHtml = template.replace('{{ content }}', processedContent).replace('{{ title }}', frontMatterData.title || 'Untitled');
    fs.writeFileSync(path.join(newDirectory, 'index.html'), newHtml);
  }
  
  console.log('Done writing pages!');
}

function getFrontMatterAndContent(markdown) {
  // Get the front matter from the markdown file
  const [frontMatter, content] = markdown.split('----');
  // Parse the front matter as YAML
  const frontMatterData = {};
  frontMatter.split('\n').forEach(line => {
    const [key, value] = line.split(':');
    if (key && value) {
      frontMatterData[key.trim()] = value.trim();
    }
  });
  return { frontMatterData, content };
}

function loadEvents() {
  const eventsFile = fs.readFileSync(path.resolve('src/events.yaml'), 'utf8');
  const eventsData = yaml.load(eventsFile);
  return eventsData.events || [];
}

function filterUpcomingEvents(events) {
  // Get current date in America/Chicago timezone
  const chicagoDateString = new Date().toLocaleDateString("en-CA", {timeZone: "America/Chicago"});
  const [todayYear, todayMonth, todayDay] = chicagoDateString.split('-');
  const today = new Date(todayYear, todayMonth - 1, todayDay);
  
  return events
    .filter(event => {
      const [year, month, day] = event.date.split('-');
      const eventDate = new Date(year, month - 1, day);
      return eventDate >= today;
    })
    .sort((a, b) => {
      const [yearA, monthA, dayA] = a.date.split('-');
      const [yearB, monthB, dayB] = b.date.split('-');
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA - dateB;
    });
}

function filterPastEvents(events) {
  // Get current date in America/Chicago timezone
  const chicagoDateString = new Date().toLocaleDateString("en-CA", {timeZone: "America/Chicago"});
  const [todayYear, todayMonth, todayDay] = chicagoDateString.split('-');
  const today = new Date(todayYear, todayMonth - 1, todayDay);
  
  return events
    .filter(event => {
      const [year, month, day] = event.date.split('-');
      const eventDate = new Date(year, month - 1, day);
      return eventDate < today;
    })
    .sort((a, b) => {
      const [yearA, monthA, dayA] = a.date.split('-');
      const [yearB, monthB, dayB] = b.date.split('-');
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateB - dateA;
    });
}

function generateEventCardHtml(event) {
  // Create date in Chicago timezone to avoid timezone issues
  const [year, month, day] = event.date.split('-');
  // Create a date string that will be interpreted consistently
  const chicagoDateString = `${year}-${month}-${day}T12:00:00`;
  const dateObj = new Date(chicagoDateString);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'America/Chicago'
  });
  
  const specialNotesHtml = event.special_notes ? 
    `<p><strong>${event.special_notes}</strong></p>` : '';
  
  const priceText = event.price || 'Details and registration';
  const buttonText = event.price ? `${event.price} – Reserve your spot` : 'Details and registration';
  
  return `
    <li class="block shadow bg-white">
      <a class="block" href="${event.url}" ${event.url.startsWith('http') ? 'target="_blank"' : ''}>
        ${event.image_url ? `<img src="${event.image_url}" alt="${event.title}" />` : ''}
        <div class="p-3">
          <h3>${event.title}</h3>
          <p>
            ${formattedDate}<br />
            ${event.time}<br />
            ${event.location}${event.model ? `<br />Model: ${event.model}` : ''}${event.instructor ? `<br />Instructor: ${event.instructor}` : ''}
          </p>
          ${specialNotesHtml}
          <button>${buttonText}</button>
        </div>
      </a>
    </li>
  `;
}

function generatePastEventHtml(event) {
  // Create date in Chicago timezone to avoid timezone issues
  const [year, month, day] = event.date.split('-');
  // Create a date string that will be interpreted consistently
  const chicagoDateString = `${year}-${month}-${day}T12:00:00`;
  const dateObj = new Date(chicagoDateString);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'America/Chicago'
  });
  
  const specialNotesHtml = event.special_notes ? ` - ${event.special_notes}` : '';
  
  return `
    <li>
      <a href="${event.url}" ${event.url.startsWith('http') ? 'target="_blank"' : ''}>
        ${event.title} - ${formattedDate}<br />
        ${event.time}<br />
        ${event.location}${event.model ? `<br />Model: ${event.model}` : ''}${event.instructor ? `<br />Instructor: ${event.instructor}` : ''}${specialNotesHtml}
      </a>
    </li>
  `;
}

// TODO: Delete the public directory before writing new files
writeIndex();
writePages();
writePosts();
