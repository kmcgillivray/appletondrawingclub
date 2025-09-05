import { eventsData } from '../data/events.js';

export function loadEvents() {
  return eventsData.events || [];
}

export function filterUpcomingEvents(events) {
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

export function filterPastEvents(events) {
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

export function formatEventDate(eventDate) {
  // Create date in Chicago timezone to avoid timezone issues
  const [year, month, day] = eventDate.split('-');
  // Create a date string that will be interpreted consistently
  const chicagoDateString = `${year}-${month}-${day}T12:00:00`;
  const dateObj = new Date(chicagoDateString);
  return dateObj.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'America/Chicago'
  });
}

export function formatEventDateShort(eventDate) {
  const [year, month, day] = eventDate.split('-');
  const chicagoDateString = `${year}-${month}-${day}T12:00:00`;
  const dateObj = new Date(chicagoDateString);
  return dateObj.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    timeZone: 'America/Chicago'
  });
}