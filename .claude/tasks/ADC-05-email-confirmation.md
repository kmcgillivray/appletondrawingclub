# ADC-05: Email Confirmation System

## User Story
As a user, I want an email confirmation that my reservation was successful so that I have a record of my registration and know that it went through.

## Acceptance Criteria
- [ ] User receives email confirmation after successful registration
- [ ] Email is sent for both pay-at-door and online payment registrations
- [ ] Email includes basic event information (title, date, time)
- [ ] Email has professional design that matches site branding
- [ ] Email includes registration confirmation number/ID
- [ ] Email is sent from a professional address (noreply@appletondrawingclub.com)
- [ ] Email delivery works reliably without going to spam
- [ ] Email includes unsubscribe option if user opted into newsletter
- [ ] System handles email delivery failures gracefully
- [ ] Confirmation emails are sent promptly after registration

## Prerequisites
- ADC-04 (Registration Feedback) completed
- Registration functions create database records
- Stripe webhook processes payments

## Implementation Steps

### 1. Set Up Email Service Provider

Sign up for Resend account and get API key.

Add to Supabase Edge Functions environment variables:
```
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@appletondrawingclub.com
```

Note: Since hello@appletondrawingclub.com isn't set up yet, use noreply@ for sending and direct users to the contact form on the website for questions.

### 2. Create Simple HTML Email Template

Create `supabase/functions/_shared/email-templates.ts`:
```typescript
interface RegistrationEmailData {
  registration: {
    id: string;
    name: string;
    email: string;
    payment_method: string;
    newsletter_signup: boolean;
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
}

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

  // Super simple HTML - just the basics
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
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  
  <h3>Event Details</h3>
  <p><strong>Date:</strong> ${eventDate}</p>
  <p><strong>Time:</strong> ${event.time}</p>
  <p><strong>Location:</strong> ${event.location.name}</p>
  <p><strong>Price:</strong> $${event.price}</p>
  
  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
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

  // Simple plain text version
  const text = `
Registration Confirmed: ${event.title}

Hi ${registration.name},

Great news! You're registered for ${event.title}.

Confirmation ID: ${confirmationId}

EVENT DETAILS
Event: ${event.title}
Date: ${eventDate}
Time: ${event.time}
Location: ${event.location.name}
Price: $${event.price}

${registration.payment_method === 'online' 
  ? `PAYMENT COMPLETE: Your payment of $${event.price} has been processed. You're all set!`
  : `PAY AT DOOR: Please bring $${event.price} (cash or card) to pay when you arrive at the event.`
}

${event.special_notes ? `IMPORTANT NOTES: ${event.special_notes}` : ''}

Questions? Contact us at https://appletondrawingclub.com/contact

Appleton Drawing Club
https://appletondrawingclub.com

${registration.newsletter_signup 
  ? 'You\'re subscribed to our newsletter. Unsubscribe: https://buttondown.email/appleton-drawing-club/unsubscribe'
  : ''
}
  `.trim();

  return { subject, html, text };
}
```

### 3. Create Email Sending Utility

Create `supabase/functions/_shared/email-utils.ts`:
```typescript
import { Resend } from 'https://esm.sh/resend@3.2.0';
import { getRegistrationConfirmationEmail } from './email-templates.ts';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface SendRegistrationEmailParams {
  registration: {
    id: string;
    name: string;
    email: string;
    payment_method: string;
    newsletter_signup: boolean;
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
}

export async function sendRegistrationConfirmationEmail(params: SendRegistrationEmailParams) {
  try {
    const { registration, event } = params;
    
    // Generate email content using simple HTML template
    const { subject, html, text } = getRegistrationConfirmationEmail({
      registration,
      event,
    });

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: Deno.env.get('FROM_EMAIL') || 'noreply@appletondrawingclub.com',
      to: [registration.email],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send registration confirmation email:', error);
    throw error;
  }
}
```

### 4. Update Registration Edge Function to Send Emails

Modify the existing `supabase/functions/register/index.ts` to integrate email sending:

```typescript
// Add these imports at the top
import { sendRegistrationConfirmationEmail } from '../_shared/email-utils.ts';
// Note: You may need to copy events.ts to the functions directory or use a different approach
// to access the events data, as Deno can't directly import from the frontend src directory

// After successful registration creation (around line 85-95):
try {
  // Find the event data from events.ts
  const eventData = Object.values(events).find(e => e.id === event_id);
  
  if (eventData) {
    // Send confirmation email
    await sendRegistrationConfirmationEmail({
      registration: {
        id: registration.id,
        name: registration.name,
        email: registration.email,
        payment_method: registration.payment_method,
        newsletter_signup: registration.newsletter_signup,
      },
      event: {
        id: eventData.id,
        title: eventData.title,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        price: eventData.price,
        special_notes: eventData.special_notes,
      },
    });
  }
} catch (emailError) {
  console.error('Failed to send confirmation email:', emailError);
  // Don't fail the registration if email fails - just log it
}
```

### 5. Create Optional Separate Email Function

Optionally, create `supabase/functions/send-confirmation-email/index.ts` for manual email sending:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendRegistrationConfirmationEmail } from '../_shared/email-utils.ts';
// Note: Copy events data to functions directory or fetch from database

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { registrationId } = await req.json();

    if (!registrationId) {
      return new Response(JSON.stringify({ error: 'Registration ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get registration details
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      console.error('Failed to fetch registration:', regError);
      return new Response(JSON.stringify({ error: 'Registration not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find event data
    const eventData = Object.values(events).find(e => e.id === registration.event_id);
    if (!eventData) {
      return new Response(JSON.stringify({ error: 'Event not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send email
    const emailResult = await sendRegistrationConfirmationEmail({
      registration: {
        id: registration.id,
        name: registration.name,
        email: registration.email,
        payment_method: registration.payment_method,
        newsletter_signup: registration.newsletter_signup,
      },
      event: {
        id: eventData.id,
        title: eventData.title,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        price: eventData.price,
        special_notes: eventData.special_notes,
      },
    });

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResult.id 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Email function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### 6. Add Environment Variables to Supabase

In Supabase Edge Functions dashboard, add:
- `RESEND_API_KEY` - Your Resend API key  
- `FROM_EMAIL` - `noreply@appletondrawingclub.com`

### 7. Deploy Edge Functions

Deploy the new functions to Supabase:

```bash
supabase functions deploy send-confirmation-email --no-verify-jwt
supabase functions deploy register --no-verify-jwt  # Redeploy with email integration
```

### 8. Set Up DNS Records

If using custom domain for emails, add these DNS records:
- MX records for email receiving (if needed)  
- SPF record: `v=spf1 include:_spf.resend.com ~all`
- DKIM record (provided by Resend)

## Testing Criteria
- [ ] Confirmation email is sent after pay-at-door registration
- [ ] Confirmation email is sent after successful online payment (when Stripe integration is added)
- [ ] Email contains all required event information
- [ ] Email has professional appearance and branding using React Email
- [ ] Email includes correct payment status information
- [ ] Email delivery doesn't cause registration to fail
- [ ] Email contains valid unsubscribe link if newsletter signup
- [ ] React Email templates render correctly across email clients
- [ ] Registration Edge Function still works if email service is down
- [ ] Email template uses TypeScript interfaces for type safety
- [ ] Plain text version is automatically generated alongside HTML

## Files Created/Modified
- `supabase/functions/_shared/email-templates.ts` - Simple HTML email templates
- `supabase/functions/_shared/email-utils.ts` - Email sending utilities using Resend
- `supabase/functions/send-confirmation-email/index.ts` - Optional standalone email function
- `supabase/functions/register/index.ts` - Updated to send confirmation email
- Supabase Edge Functions environment variables - Added email service configuration

## Next Steps
After completing this task, proceed to **ADC-06** to enhance the email confirmation with detailed event information and additional features.