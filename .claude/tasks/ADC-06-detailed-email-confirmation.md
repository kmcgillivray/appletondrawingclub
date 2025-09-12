# ADC-06: Enhanced Event Information in Email

## User Story
As a user, I want the email confirmation to include additional helpful event details like what to bring, parking information, and easy ways to add the event to my calendar.

## Acceptance Criteria
- [ ] Email includes what to bring and what's provided
- [ ] Email includes parking and arrival instructions  
- [ ] Email includes add-to-calendar link for Google Calendar
- [ ] Email includes map/directions link
- [ ] Email shows model/instructor information when available
- [ ] Email includes event description
- [ ] Email shows refund policy information
- [ ] Email has mobile-friendly responsive design
- [ ] Email includes event image when available

## Prerequisites
- ADC-05 (Simple Email Confirmation System) completed
- Basic email templates are working
- Event data structure supports additional fields

## Implementation Steps

### 1. Enhance Event Data Structure

Update the event interface in `src/lib/types.ts` to support additional fields:

```typescript
export interface Event {
  // Existing fields...
  id: string;
  title: string;
  date: string;
  time: string;
  location: {
    name: string;
    address: string;
  };
  price: number;
  // ... other existing fields
  
  // New optional fields for enhanced emails
  what_to_bring?: string[];
  what_we_provide?: string[];
  parking_info?: string;
  arrival_info?: string;
  refund_policy?: string;
  image_url?: string;
}
```

Then add enhanced details to an event in `src/lib/data/events.ts`:
```typescript
export const events = {
  'test-event': {
    // ... existing basic fields
    
    // New enhanced fields
    what_to_bring: [
      'Drawing materials (pencils, charcoal, pastels, etc.)',
      'Paper or sketchbooks', 
      'Eraser and blending tools',
      'Water bottle'
    ],
    what_we_provide: [
      'Professional model',
      'Easels and drawing boards',
      'Good lighting setup', 
      'Chairs and seating',
      'Timer for pose changes'
    ],
    parking_info: 'Free parking available in the lot behind the building. Street parking also available.',
    arrival_info: 'Please arrive 10-15 minutes early to set up your materials. The building entrance is on Main Street.',
    refund_policy: 'Refunds available up to 24 hours before the event.',
    image_url: 'https://res.cloudinary.com/appleton-drawing-club/image/upload/v1/events/mixed-pose-drawing.jpg'
  }
};
```

### 2. Enhance Simple Email Template  

Update the simple email template in `supabase/functions/_shared/email-templates.ts` to include the enhanced information while keeping it simple and readable:

Add these enhancements to the existing `getRegistrationConfirmationEmail` function:

```typescript
// Add these helper functions at the top of the file
const createCalendarUrl = (event: any, registrationId: string) => {
  const eventTitle = encodeURIComponent(event.title);
  const eventDetails = encodeURIComponent(`Registration ID: ${registrationId}\n\nContact: https://appletondrawingclub.com/contact`);
  const location = encodeURIComponent(event.location?.address || event.location?.name || event.location);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&location=${location}`;
};

const createMapUrl = (event: any) => {
  const location = event.location?.address || event.location?.name || event.location;
  return `https://maps.google.com/maps?q=${encodeURIComponent(location)}`;
};

// Then enhance the main function
export function getRegistrationConfirmationEmail(data: RegistrationEmailData) {
  const { registration, event } = data;
  const confirmationId = registration.id.slice(0, 8);
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric',
  });

  const subject = `Registration Confirmed: ${event.title}`;

  // Enhanced but still simple HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  
  <h1 style="color: #16a34a;">Appleton Drawing Club</h1>
  
  <h2>Registration Confirmed!</h2>
  
  <p>Hi <strong>${registration.name}</strong>,</p>
  
  <p>You're registered for <strong>${event.title}</strong>.</p>
  
  <p><strong>Confirmation ID:</strong> ${confirmationId}</p>

  ${event.image_url ? `<img src="${event.image_url}" alt="${event.title}" style="width: 100%; max-width: 400px; border-radius: 8px; margin: 20px 0;">` : ''}
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  
  <h3>Event Details</h3>
  <p><strong>Date:</strong> ${eventDate}</p>
  <p><strong>Time:</strong> ${event.time}</p>
  <p><strong>Location:</strong> ${event.location.name || event.location}</p>
  ${event.location.address ? `<p><strong>Address:</strong> ${event.location.address}</p>` : ''}
  <p><strong>Price:</strong> $${event.price}</p>
  
  <div style="margin: 20px 0;">
    <a href="${createCalendarUrl(event, confirmationId)}" style="display: inline-block; background: #16a34a; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-right: 10px;">📅 Add to Calendar</a>
    <a href="${createMapUrl(event)}" style="display: inline-block; background: #f5f5f5; color: #333; padding: 10px 15px; text-decoration: none; border-radius: 5px;">🗺️ Directions</a>
  </div>

  ${event.description ? `
  <h3>About This Event</h3>
  <p style="color: #666; line-height: 1.5;">${event.description}</p>
  ` : ''}

  ${event.model || event.instructor ? `
  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p><strong>${event.event_type === 'workshop' ? 'Instructor' : 'Model'}:</strong> ${event.instructor || event.model}</p>
  </div>
  ` : ''}

  ${event.what_to_bring || event.what_we_provide ? `
  <h3>What to Know</h3>
  ${event.what_to_bring ? `
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
      <p><strong>Please bring:</strong></p>
      <ul>${event.what_to_bring.map(item => `<li>${item}</li>`).join('')}</ul>
    </div>
  ` : ''}
  ${event.what_we_provide ? `
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
      <p><strong>We'll provide:</strong></p>
      <ul>${event.what_we_provide.map(item => `<li>${item}</li>`).join('')}</ul>
    </div>
  ` : ''}
  ` : ''}

  ${event.parking_info || event.arrival_info ? `
  <h3>Getting There</h3>
  ${event.parking_info ? `<p><strong>Parking:</strong> ${event.parking_info}</p>` : ''}
  ${event.arrival_info ? `<p><strong>Arrival:</strong> ${event.arrival_info}</p>` : ''}
  ` : ''}
  
  <div style="background: ${registration.payment_method === 'online' ? '#f0f9ff' : '#fffbeb'}; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p><strong>Payment:</strong> ${registration.payment_method === 'online' 
      ? `Payment complete - you're all set!`
      : `Please bring $${event.price} (cash or card) to pay at the door.`
    }</p>
  </div>
  
  ${event.special_notes ? `
  <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p><strong>Important:</strong> ${event.special_notes}</p>
  </div>
  ` : ''}

  ${event.refund_policy ? `
  <p style="font-size: 14px; color: #666;"><strong>Refund Policy:</strong> ${event.refund_policy}</p>
  ` : ''}
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  
  <p>Questions? <a href="https://appletondrawingclub.com/contact">Contact us here</a></p>
  
  <p style="font-size: 14px; color: #666;">
    Appleton Drawing Club<br>
    <a href="https://appletondrawingclub.com">appletondrawingclub.com</a>
  </p>
  
  ${registration.newsletter_signup ? `
  <p style="font-size: 12px; color: #999;">
    <a href="https://buttondown.email/appleton-drawing-club/unsubscribe">Unsubscribe from newsletter</a>
  </p>
  ` : ''}

</body>
</html>`;

  // Enhanced plain text version
  const text = `
Registration Confirmed: ${event.title}

Hi ${registration.name},

You're registered for ${event.title}.

Confirmation ID: ${confirmationId}

EVENT DETAILS
Date: ${eventDate}
Time: ${event.time}
Location: ${event.location.name || event.location}
${event.location.address ? `Address: ${event.location.address}` : ''}
Price: $${event.price}

${event.description ? `ABOUT THIS EVENT\n${event.description}\n` : ''}

${event.model || event.instructor ? `${event.event_type === 'workshop' ? 'INSTRUCTOR' : 'MODEL'}: ${event.instructor || event.model}\n` : ''}

${event.what_to_bring ? `PLEASE BRING:\n${event.what_to_bring.map(item => `• ${item}`).join('\n')}\n` : ''}

${event.what_we_provide ? `WE'LL PROVIDE:\n${event.what_we_provide.map(item => `• ${item}`).join('\n')}\n` : ''}

${event.parking_info ? `PARKING: ${event.parking_info}\n` : ''}
${event.arrival_info ? `ARRIVAL: ${event.arrival_info}\n` : ''}

PAYMENT: ${registration.payment_method === 'online' 
  ? `Payment complete - you're all set!`
  : `Please bring $${event.price} (cash or card) to pay at the door.`
}

${event.special_notes ? `IMPORTANT: ${event.special_notes}\n` : ''}

${event.refund_policy ? `REFUND POLICY: ${event.refund_policy}\n` : ''}

Add to Calendar: ${createCalendarUrl(event, confirmationId)}
Get Directions: ${createMapUrl(event)}

Questions? Contact us at https://appletondrawingclub.com/contact

Appleton Drawing Club
https://appletondrawingclub.com

${registration.newsletter_signup 
  ? 'You\'re subscribed to our newsletter. Unsubscribe: https://buttondown.email/appleton-drawing-club/unsubscribe'
  : ''
}
  `.trim();

  return { subject, html, text };
};
```

## Testing Criteria
- [ ] Enhanced email includes all comprehensive event details
- [ ] Calendar links work correctly and populate event information  
- [ ] Map links open correct location
- [ ] Email displays properly on mobile devices
- [ ] All conditional content displays correctly based on available event data
- [ ] Payment status section shows correct information
- [ ] Contact information directs to website contact form
- [ ] Event images display properly when available
- [ ] Plain text version includes all essential enhanced information
- [ ] Email maintains simple, readable design while adding useful details

## Files Modified
- `src/lib/types.ts` - Enhanced Event interface with additional optional fields
- `src/lib/data/events.ts` - Updated event data with enhanced details  
- `supabase/functions/_shared/email-templates.ts` - Enhanced simple email template

## Next Steps  
This builds on the simple email foundation from ADC-05 and adds useful enhanced information while keeping the design clean and maintainable. The next phase could include:
- Admin interface for managing events with enhanced data
- Integration with real calendar systems
- A/B testing different email designs
- Analytics on email engagement
