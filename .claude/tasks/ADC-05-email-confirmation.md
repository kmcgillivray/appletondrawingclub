# ADC-05: Email Confirmation System

## User Story
As a user, I want an email confirmation that my reservation was successful so that I have a record of my registration and know that it went through.

## Acceptance Criteria
- [ ] User receives email confirmation after successful registration
- [ ] Email is sent for both pay-at-door and online payment registrations
- [ ] Email includes basic event information (title, date, time)
- [ ] Email has professional design that matches site branding
- [ ] Email includes registration confirmation number/ID
- [ ] Email is sent from a professional address (no-reply@appletondrawingclub.com)
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

Choose and configure Resend (recommended for simplicity):

```bash
npm install resend
```

Sign up for Resend account and get API key.

Add to `.env.local`:
```
RESEND_API_KEY=re_...
FROM_EMAIL=hello@appletondrawingclub.com
```

### 2. Create Email Templates

Create `src/lib/email/templates.js`:
```javascript
export function getRegistrationConfirmationEmail(registration, event) {
    const subject = `Registration Confirmed: ${event.title}`;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Confirmation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #16a34a;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #16a34a;
        }
        .confirmation-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .event-details {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-label {
            font-weight: 600;
            color: #6b7280;
        }
        .detail-value {
            color: #111827;
        }
        .payment-info {
            background: ${registration.payment_method === 'online' ? '#eff6ff' : '#fef3c7'};
            border: 1px solid ${registration.payment_method === 'online' ? '#dbeafe' : '#fde68a'};
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }
        .button {
            display: inline-block;
            background: #16a34a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Appleton Drawing Club</div>
        <p>Your creative community in Appleton, WI</p>
    </div>
    
    <div class="confirmation-box">
        <h2 style="color: #16a34a; margin: 0 0 10px 0;">✓ Registration Confirmed!</h2>
        <p>Hi ${registration.name},</p>
        <p>Great news! You're registered for <strong>${event.title}</strong>.</p>
        <p><strong>Confirmation ID:</strong> ${registration.id.slice(0, 8)}</p>
    </div>
    
    <div class="event-details">
        <h3 style="margin-top: 0;">Event Details</h3>
        <div class="detail-row">
            <span class="detail-label">Event:</span>
            <span class="detail-value">${event.title}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${event.time}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Location:</span>
            <span class="detail-value">${event.location}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Price:</span>
            <span class="detail-value">$${event.price}</span>
        </div>
    </div>
    
    <div class="payment-info">
        ${registration.payment_method === 'online' ? `
            <h4 style="margin: 0 0 10px 0; color: #1e40af;">💳 Payment Complete</h4>
            <p style="margin: 0;">Your payment of $${event.price} has been processed. You're all set!</p>
        ` : `
            <h4 style="margin: 0 0 10px 0; color: #d97706;">💰 Pay at Door</h4>
            <p style="margin: 0;">Please bring $${event.price} (cash or card) to pay when you arrive at the event.</p>
        `}
    </div>
    
    ${event.special_notes ? `
        <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">📝 Important Notes</h4>
            <p style="margin: 0;">${event.special_notes}</p>
        </div>
    ` : ''}
    
    <div style="margin: 30px 0; text-align: center;">
        <p>Questions? We're here to help!</p>
        <a href="mailto:hello@appletondrawingclub.com" class="button">Contact Us</a>
    </div>
    
    <div class="footer">
        <p>Appleton Drawing Club<br>
        Bringing together artists of all levels in the Fox Cities</p>
        <p>
            <a href="https://appletondrawingclub.com">Visit our website</a> | 
            <a href="mailto:hello@appletondrawingclub.com">Contact us</a>
        </p>
        ${registration.newsletter_signup ? `
            <p style="margin-top: 20px; font-size: 12px;">
                You're subscribed to our newsletter. 
                <a href="https://buttondown.email/appleton-drawing-club/unsubscribe">Unsubscribe</a>
            </p>
        ` : ''}
    </div>
</body>
</html>`;

    const text = `
Registration Confirmed: ${event.title}

Hi ${registration.name},

Great news! You're registered for ${event.title}.

Confirmation ID: ${registration.id.slice(0, 8)}

EVENT DETAILS
Event: ${event.title}
Date: ${new Date(event.date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
})}
Time: ${event.time}
Location: ${event.location}
Price: $${event.price}

${registration.payment_method === 'online' 
    ? `PAYMENT COMPLETE: Your payment of $${event.price} has been processed. You're all set!`
    : `PAY AT DOOR: Please bring $${event.price} (cash or card) to pay when you arrive at the event.`
}

${event.special_notes ? `IMPORTANT NOTES: ${event.special_notes}` : ''}

Questions? Contact us at hello@appletondrawingclub.com

Appleton Drawing Club
https://appletondrawingclub.com
`;

    return { subject, html, text };
}
```

### 3. Create Email Service Module

Create `src/lib/email/service.js`:
```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html, text }) {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'hello@appletondrawingclub.com',
            to: [to],
            subject,
            html,
            text
        });

        if (error) {
            console.error('Email send error:', error);
            throw new Error(error.message);
        }

        console.log('Email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}
```

### 4. Create Email Sending Function

Create `netlify/functions/send-confirmation-email.js`:
```javascript
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { registrationId } = JSON.parse(event.body);

        if (!registrationId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Registration ID is required' })
            };
        }

        // Get registration and event details
        const { data: registration, error: regError } = await supabase
            .from('registrations')
            .select(`
                *,
                events (*)
            `)
            .eq('id', registrationId)
            .single();

        if (regError || !registration) {
            console.error('Failed to fetch registration:', regError);
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Registration not found' })
            };
        }

        const event = registration.events;
        const emailContent = getRegistrationConfirmationEmail(registration, event);

        // Send email
        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'hello@appletondrawingclub.com',
            to: [registration.email],
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text
        });

        if (error) {
            console.error('Email send error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to send email' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, emailId: data.id })
        };
    } catch (error) {
        console.error('Email function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

function getRegistrationConfirmationEmail(registration, event) {
    const subject = `Registration Confirmed: ${event.title}`;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Confirmation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #16a34a;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #16a34a;
        }
        .confirmation-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .event-details {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-label {
            font-weight: 600;
            color: #6b7280;
        }
        .detail-value {
            color: #111827;
        }
        .payment-info {
            background: ${registration.payment_method === 'online' ? '#eff6ff' : '#fef3c7'};
            border: 1px solid ${registration.payment_method === 'online' ? '#dbeafe' : '#fde68a'};
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }
        .button {
            display: inline-block;
            background: #16a34a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Appleton Drawing Club</div>
        <p>Your creative community in Appleton, WI</p>
    </div>
    
    <div class="confirmation-box">
        <h2 style="color: #16a34a; margin: 0 0 10px 0;">✓ Registration Confirmed!</h2>
        <p>Hi ${registration.name},</p>
        <p>Great news! You're registered for <strong>${event.title}</strong>.</p>
        <p><strong>Confirmation ID:</strong> ${registration.id.slice(0, 8)}</p>
    </div>
    
    <div class="event-details">
        <h3 style="margin-top: 0;">Event Details</h3>
        <div class="detail-row">
            <span class="detail-label">Event:</span>
            <span class="detail-value">${event.title}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${event.time}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Location:</span>
            <span class="detail-value">${event.location}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Price:</span>
            <span class="detail-value">$${event.price}</span>
        </div>
    </div>
    
    <div class="payment-info">
        ${registration.payment_method === 'online' ? `
            <h4 style="margin: 0 0 10px 0; color: #1e40af;">💳 Payment Complete</h4>
            <p style="margin: 0;">Your payment of $${event.price} has been processed. You're all set!</p>
        ` : `
            <h4 style="margin: 0 0 10px 0; color: #d97706;">💰 Pay at Door</h4>
            <p style="margin: 0;">Please bring $${event.price} (cash or card) to pay when you arrive at the event.</p>
        `}
    </div>
    
    ${event.special_notes ? `
        <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">📝 Important Notes</h4>
            <p style="margin: 0;">${event.special_notes}</p>
        </div>
    ` : ''}
    
    <div style="margin: 30px 0; text-align: center;">
        <p>Questions? We're here to help!</p>
        <a href="mailto:hello@appletondrawingclub.com" class="button">Contact Us</a>
    </div>
    
    <div class="footer">
        <p>Appleton Drawing Club<br>
        Bringing together artists of all levels in the Fox Cities</p>
        <p>
            <a href="https://appletondrawingclub.com">Visit our website</a> | 
            <a href="mailto:hello@appletondrawingclub.com">Contact us</a>
        </p>
        ${registration.newsletter_signup ? `
            <p style="margin-top: 20px; font-size: 12px;">
                You're subscribed to our newsletter. 
                <a href="https://buttondown.email/appleton-drawing-club/unsubscribe">Unsubscribe</a>
            </p>
        ` : ''}
    </div>
</body>
</html>`;

    const text = `
Registration Confirmed: ${event.title}

Hi ${registration.name},

Great news! You're registered for ${event.title}.

Confirmation ID: ${registration.id.slice(0, 8)}

EVENT DETAILS
Event: ${event.title}
Date: ${new Date(event.date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
})}
Time: ${event.time}
Location: ${event.location}
Price: $${event.price}

${registration.payment_method === 'online' 
    ? `PAYMENT COMPLETE: Your payment of $${event.price} has been processed. You're all set!`
    : `PAY AT DOOR: Please bring $${event.price} (cash or card) to pay when you arrive at the event.`
}

${event.special_notes ? `IMPORTANT NOTES: ${event.special_notes}` : ''}

Questions? Contact us at hello@appletondrawingclub.com

Appleton Drawing Club
https://appletondrawingclub.com
`;

    return { subject, html, text };
}
```

### 5. Update Registration Functions to Send Emails

Update `netlify/functions/register.js` to send confirmation email:
```javascript
// ... existing code

// After successful registration creation
const { data: registration, error: regError } = await supabase
    .from('registrations')
    .insert([{
        event_id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        payment_method,
        payment_status: 'pending',
        newsletter_signup: newsletter_signup || false
    }])
    .select()
    .single();

if (regError) {
    console.error('Database error:', regError);
    return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unable to process registration. Please try again.' })
    };
}

// Send confirmation email
try {
    await fetch(`${process.env.URL || 'http://localhost:8888'}/.netlify/functions/send-confirmation-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: registration.id })
    });
} catch (emailError) {
    console.error('Failed to send confirmation email:', emailError);
    // Don't fail the registration if email fails
}

// ... rest of function
```

Update `netlify/functions/stripe-webhook.js` to send email after payment:
```javascript
// ... existing handleCheckoutCompleted function

async function handleCheckoutCompleted(session) {
    try {
        const { event_id, event_title, name, email, newsletter_signup } = session.metadata;

        console.log('Creating registration for:', { event_id, name, email });

        // Create registration record
        const { data: registration, error: regError } = await supabase
            .from('registrations')
            .insert([{
                event_id,
                name,
                email,
                payment_method: 'online',
                payment_status: 'completed',
                newsletter_signup: newsletter_signup === 'true'
            }])
            .select()
            .single();

        if (regError) {
            console.error('Failed to create registration:', regError);
            return;
        }

        console.log('Registration created successfully:', registration.id);
        
        // Send confirmation email
        try {
            await fetch(`${process.env.URL || 'http://localhost:8888'}/.netlify/functions/send-confirmation-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationId: registration.id })
            });
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
        }
        
    } catch (error) {
        console.error('Error handling checkout completion:', error);
    }
}
```

### 6. Add Environment Variables to Netlify

In Netlify dashboard, add:
- `RESEND_API_KEY` - Your Resend API key
- `FROM_EMAIL` - `hello@appletondrawingclub.com`

### 7. Set Up DNS Records

If using custom domain for emails, add these DNS records:
- MX records for email receiving (if needed)
- SPF record: `v=spf1 include:_spf.resend.com ~all`
- DKIM record (provided by Resend)

## Testing Criteria
- [ ] Confirmation email is sent after pay-at-door registration
- [ ] Confirmation email is sent after successful online payment
- [ ] Email contains all required event information
- [ ] Email has professional appearance and branding
- [ ] Email includes correct payment status information
- [ ] Email delivery doesn't cause registration to fail
- [ ] Email contains valid unsubscribe link if newsletter signup
- [ ] Email templates render correctly across email clients
- [ ] Registration function still works if email service is down

## Files Created/Modified
- `netlify/functions/send-confirmation-email.js` - Email sending function
- `netlify/functions/register.js` - Updated to send confirmation email
- `netlify/functions/stripe-webhook.js` - Updated to send confirmation email
- `.env.local` - Added email service environment variables

## Next Steps
After completing this task, proceed to **ADC-06** to enhance the email confirmation with detailed event information and additional features.