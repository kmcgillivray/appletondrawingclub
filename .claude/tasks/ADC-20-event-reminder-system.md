# ADC-20: Event Reminder System

## User Story
As a registered attendee, I want to receive a reminder email 1 day before an event so that I don't forget to attend and can prepare accordingly.

## Acceptance Criteria
- [ ] Attendees receive a reminder email 24 hours before their registered event
- [ ] Reminder emails are only sent to users with active registrations (not canceled)
- [ ] No duplicate reminder emails are sent for the same registration
- [ ] Reminder emails include essential event details (time, location, what to bring)
- [ ] System handles timezone considerations for daily execution
- [ ] Failed reminder sends are logged for monitoring
- [ ] Reminders are not sent for events that are already completed or canceled

## Prerequisites
- Email confirmation system (ADC-06) completed
- Active Supabase database with registrations table
- Resend email integration working

## Technical Architecture

### pg_cron Integration
Use Supabase's `pg_cron` extension to trigger an Edge Function daily:
- Daily cron job runs at 9:00 AM Central Time
- Triggers Edge Function to check for events happening tomorrow
- Function queries active registrations and sends reminder emails

### Database Schema
Add reminder tracking table to prevent duplicates:
```sql
CREATE TABLE event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT '1_day',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(registration_id, reminder_type)
);
```

## Implementation Steps

### 1. Create Reminder Tracking Table
Add migration to create the `event_reminders` table in Supabase dashboard:
```sql
-- Migration: Add event reminders tracking
CREATE TABLE event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT '1_day',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(registration_id, reminder_type)
);

-- Add index for efficient querying
CREATE INDEX idx_event_reminders_registration_type ON event_reminders(registration_id, reminder_type);
```

### 2. Create Reminder Email Template
Add to `supabase/functions/_shared/email-templates.ts`:
```typescript
export function getEventReminderEmail(data: {
  registration: {
    id: string;
    name: string;
    email: string;
    quantity: number;
    payment_method: string;
  };
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: {
      name: string;
      address: string;
    };
    price: number;
    special_notes?: string;
  };
}) {
  const { registration, event } = data;
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `Tomorrow: ${event.title}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">

  <h1 style="color: #16a34a;">Appleton Drawing Club</h1>

  <h2>Event Reminder - Tomorrow!</h2>

  <p>Hi <strong>${registration.name}</strong>,</p>

  <p>This is a friendly reminder that you're registered for <strong>${event.title}</strong> tomorrow!</p>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Event Details</h3>
    <p><strong>Date:</strong> ${eventDate}</p>
    <p><strong>Time:</strong> ${event.time}</p>
    <p><strong>Location:</strong> ${event.location.name}</p>
    <p><strong>Address:</strong> ${event.location.address}</p>
    <p><strong>Price:</strong> $${event.price}</p>
  </div>

  <div style="background: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p><strong>Payment Reminder:</strong> ${registration.payment_method === 'online'
      ? `Your payment is complete - you're all set!`
      : `Please bring $${event.price} (cash or card) to pay at the door.`
    }</p>
  </div>

  ${event.special_notes ? `
  <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p><strong>Important:</strong> ${event.special_notes}</p>
  </div>
  ` : ''}

  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p><strong>What to bring:</strong></p>
    <ul>
      <li>Drawing materials (pencils, charcoal, pastels, etc.)</li>
      <li>Paper or sketchbooks</li>
      <li>Eraser and blending tools</li>
      <li>Water bottle</li>
    </ul>
    <p><em>We'll provide easels, drawing boards, and seating.</em></p>
  </div>

  <p>Looking forward to seeing you there!</p>

  <p>Questions? <a href="https://appletondrawingclub.com/contact">Contact us here</a></p>

  <p style="font-size: 14px; color: #666;">
    Appleton Drawing Club<br>
    <a href="https://appletondrawingclub.com">appletondrawingclub.com</a>
  </p>

</body>
</html>`;

  const text = `
Event Reminder - Tomorrow!

Hi ${registration.name},

This is a friendly reminder that you're registered for ${event.title} tomorrow!

EVENT DETAILS
Date: ${eventDate}
Time: ${event.time}
Location: ${event.location.name}
Address: ${event.location.address}
Price: $${event.price}

PAYMENT: ${registration.payment_method === 'online'
  ? `Your payment is complete - you're all set!`
  : `Please bring $${event.price} (cash or card) to pay at the door.`
}

${event.special_notes ? `IMPORTANT: ${event.special_notes}\n` : ''}

WHAT TO BRING:
• Drawing materials (pencils, charcoal, pastels, etc.)
• Paper or sketchbooks
• Eraser and blending tools
• Water bottle

We'll provide easels, drawing boards, and seating.

Looking forward to seeing you there!

Questions? Contact us at https://appletondrawingclub.com/contact

Appleton Drawing Club
https://appletondrawingclub.com
  `.trim();

  return { subject, html, text };
}
```

### 3. Create Event Reminder Edge Function
Create `supabase/functions/event-reminder-cron/index.ts`:
```typescript
import { createSupabaseClient } from "../_shared/supabase.ts";
import { getEventReminderEmail } from "../_shared/email-templates.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    console.log("Starting event reminder cron job...");
    const supabase = createSupabaseClient();

    // Calculate tomorrow's date in YYYY-MM-DD format
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    console.log(`Looking for events on ${tomorrowDate}`);

    // Find all active registrations for events happening tomorrow
    const { data: registrations, error: regError } = await supabase
      .from("registrations")
      .select(`
        id,
        name,
        email,
        quantity,
        payment_method,
        event_id,
        events!inner (
          id,
          title,
          date,
          time,
          price,
          special_notes,
          status,
          location:locations (
            name,
            street_address,
            locality,
            region,
            postal_code
          )
        )
      `)
      .eq("events.date", tomorrowDate)
      .eq("events.status", "registration_open")
      .eq("processing_status", "completed");

    if (regError) {
      console.error("Error fetching registrations:", regError);
      throw regError;
    }

    if (!registrations || registrations.length === 0) {
      console.log("No registrations found for tomorrow");
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${registrations.length} registrations for tomorrow`);

    let sentCount = 0;
    const errors = [];

    for (const registration of registrations) {
      try {
        // Check if reminder already sent
        const { data: existingReminder } = await supabase
          .from("event_reminders")
          .select("id")
          .eq("registration_id", registration.id)
          .eq("reminder_type", "1_day")
          .single();

        if (existingReminder) {
          console.log(`Reminder already sent for registration ${registration.id}`);
          continue;
        }

        // Send reminder email
        const emailFrom = Deno.env.get("TRANSACTIONAL_FROM_EMAIL") || "noreply@appletondrawingclub.com";

        const { subject, html, text } = getEventReminderEmail({
          registration: {
            id: registration.id,
            name: registration.name,
            email: registration.email,
            quantity: registration.quantity,
            payment_method: registration.payment_method,
          },
          event: {
            id: registration.events.id,
            title: registration.events.title,
            date: registration.events.date,
            time: registration.events.time,
            price: registration.events.price,
            special_notes: registration.events.special_notes,
            location: {
              name: registration.events.location.name,
              address: `${registration.events.location.street_address}, ${registration.events.location.locality}, ${registration.events.location.region} ${registration.events.location.postal_code}`,
            },
          },
        });

        const { error: emailError } = await resend.emails.send({
          from: `Appleton Drawing Club <${emailFrom}>`,
          to: [registration.email],
          subject,
          html,
          text,
        });

        if (emailError) {
          console.error(`Failed to send reminder to ${registration.email}:`, emailError);
          errors.push({ registration_id: registration.id, error: emailError.message });
          continue;
        }

        // Record that reminder was sent
        const { error: trackingError } = await supabase
          .from("event_reminders")
          .insert({
            registration_id: registration.id,
            event_id: registration.event_id,
            reminder_type: "1_day",
          });

        if (trackingError) {
          console.error(`Failed to track reminder for ${registration.id}:`, trackingError);
          // Don't fail the whole process for tracking errors
        }

        console.log(`Reminder sent to ${registration.email} for event ${registration.events.title}`);
        sentCount++;

      } catch (error) {
        console.error(`Error processing registration ${registration.id}:`, error);
        errors.push({ registration_id: registration.id, error: error.message });
      }
    }

    console.log(`Event reminder cron job completed. Sent: ${sentCount}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        errors: errors.length,
        errorDetails: errors
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Event reminder cron job failed:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

### 4. Set Up pg_cron Job
In Supabase SQL Editor, create the cron job:
```sql
-- Create daily cron job to send event reminders at 9:00 AM Central Time
-- (14:00 UTC accounting for CDT, adjust for CST as needed)
SELECT cron.schedule(
  'daily-event-reminders',
  '0 14 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://your-project-ref.supabase.co/functions/v1/event-reminder-cron',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || 'your-service-role-key' || '"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

### 5. Deploy Edge Function
Deploy the function:
```bash
supabase functions deploy event-reminder-cron --no-verify-jwt
```

## Testing Criteria
- [ ] Cron job triggers Edge Function daily at correct time
- [ ] Function correctly identifies events happening tomorrow
- [ ] Reminder emails are sent to all active registrations
- [ ] No duplicate reminders are sent for same registration
- [ ] Canceled or completed events don't trigger reminders
- [ ] Email content includes all essential event information
- [ ] Failed sends are properly logged and tracked
- [ ] Function handles timezone considerations correctly

## Files Created/Modified
- `supabase/functions/event-reminder-cron/index.ts` - New Edge Function for sending reminders
- `supabase/functions/_shared/email-templates.ts` - Add reminder email template
- Database migration - Add `event_reminders` table
- SQL query - Create pg_cron job

## Future Enhancements
- [ ] Multiple reminder types (3-day, morning-of)
- [ ] User preference for opt-out of reminders
- [ ] Dashboard to monitor reminder statistics
- [ ] A/B testing for reminder timing
- [ ] Integration with calendar systems for automatic reminders

## Notes
- Start with 1-day reminders to keep it simple
- pg_cron provides reliable scheduling within Supabase
- Edge Functions are cost-effective for this type of batch processing
- Reminder tracking prevents duplicates and provides audit trail