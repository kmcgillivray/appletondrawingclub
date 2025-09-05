import { eventsData } from '../data/events.js';

export function loadEvents(): any[] {
  return eventsData.events || [];
}

export function filterUpcomingEvents(events: any[]): any[] {
  // Get current date in America/Chicago timezone
  const chicagoDateString = new Date().toLocaleDateString("en-CA", {timeZone: "America/Chicago"});
  const [todayYear, todayMonth, todayDay] = chicagoDateString.split('-');
  const today = new Date(parseInt(todayYear), parseInt(todayMonth) - 1, parseInt(todayDay));
  
  return events
    .filter(event => {
      const [year, month, day] = event.date.split('-');
      const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return eventDate >= today;
    })
    .sort((a, b) => {
      const [yearA, monthA, dayA] = a.date.split('-');
      const [yearB, monthB, dayB] = b.date.split('-');
      const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
      const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
      return dateA.getTime() - dateB.getTime();
    });
}

export function filterPastEvents(events: any[]): any[] {
  // Get current date in America/Chicago timezone
  const chicagoDateString = new Date().toLocaleDateString("en-CA", {timeZone: "America/Chicago"});
  const [todayYear, todayMonth, todayDay] = chicagoDateString.split('-');
  const today = new Date(parseInt(todayYear), parseInt(todayMonth) - 1, parseInt(todayDay));
  
  return events
    .filter(event => {
      const [year, month, day] = event.date.split('-');
      const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return eventDate < today;
    })
    .sort((a, b) => {
      const [yearA, monthA, dayA] = a.date.split('-');
      const [yearB, monthB, dayB] = b.date.split('-');
      const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
      const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
      return dateB.getTime() - dateA.getTime();
    });
}

export function formatEventDate(eventDate: string): string {
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

export function formatEventDateShort(eventDate: string): string {
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