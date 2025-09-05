# ADC-06: Detailed Email Confirmation

## User Story
As a user, I want the email confirmation to include the important event details so that I have all the information I need for the event in one place.

## Acceptance Criteria
- [ ] Email includes comprehensive event details (date, time, location with address)
- [ ] Email shows what to bring and what's provided
- [ ] Email includes parking and arrival instructions
- [ ] Email has contact information for questions
- [ ] Email includes calendar attachment or add-to-calendar link
- [ ] Email shows model/instructor information when available
- [ ] Email includes event policies and code of conduct link
- [ ] Email has map link or location directions
- [ ] Email shows refund policy information
- [ ] Email includes social media links for the club
- [ ] Email has mobile-friendly design
- [ ] Email includes event image when available

## Prerequisites
- ADC-05 (Email Confirmation System) completed
- Email templates are working
- Event data includes all necessary details

## Implementation Steps

### 1. Create Enhanced Event Data Structure

First, update the test event data to include comprehensive details.

Update `src/routes/events/test-event/+page.svelte`:
```svelte
<script>
  const event = {
    id: 'test-event',
    title: 'Mixed Pose Life Drawing',
    description: 'Join us for an evening of life drawing with mixed poses ranging from quick gesture sketches to longer studies. This session is perfect for artists of all levels who want to improve their figure drawing skills.',
    date: '2024-03-14',
    time: '7:00-9:00PM', 
    location: 'The Photo Opp Studio',
    address: '123 Main Street, Appleton, WI 54911',
    price: 15.00,
    capacity: 20,
    event_type: 'figure_drawing',
    model: 'Professional model with 5+ years experience',
    instructor: null,
    special_notes: 'Bring your own drawing materials (paper, pencils, charcoal, etc.). Easels and drawing boards will be provided.',
    image_url: 'https://res.cloudinary.com/appleton-drawing-club/image/upload/v1/events/mixed-pose-drawing.jpg',
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
    refund_policy: 'Refunds available up to 24 hours before the event. Contact hello@appletondrawingclub.com',
    code_of_conduct_url: 'https://appletondrawingclub.com/code-of-conduct'
  };
</script>
```

### 2. Create Enhanced Email Template

Update the email template in `netlify/functions/send-confirmation-email.js`:

```javascript
function getRegistrationConfirmationEmail(registration, event) {
    const subject = `You're all set for ${event.title}!`;
    
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const addToCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${encodeURIComponent(event.date.replace(/-/g, '') + 'T190000/' + event.date.replace(/-/g, '') + 'T210000')}&details=${encodeURIComponent(`${event.description}\n\nRegistration ID: ${registration.id.slice(0, 8)}\n\nQuestions? Contact hello@appletondrawingclub.com`)}&location=${encodeURIComponent(event.address || event.location)}`;

    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(event.address || event.location)}`;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're all set for ${event.title}!</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .email-container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            text-align: center;
            padding: 30px 20px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .tagline {
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 30px;
        }
        .confirmation-box {
            background: #f0fdf4;
            border: 2px solid #bbf7d0;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }
        .confirmation-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        .event-hero {
            margin: 25px 0;
            text-align: center;
        }
        .event-hero img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
        }
        .event-title {
            font-size: 24px;
            font-weight: bold;
            color: #16a34a;
            margin: 15px 0;
        }
        .quick-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 25px 0;
        }
        .quick-detail {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #16a34a;
        }
        .quick-detail-label {
            font-weight: 600;
            color: #374151;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .quick-detail-value {
            color: #111827;
            font-weight: 500;
        }
        .section {
            margin: 30px 0;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .section-icon {
            margin-right: 8px;
            font-size: 20px;
        }
        .payment-status {
            background: ${registration.payment_method === 'online' ? '#eff6ff' : '#fef3c7'};
            border: 2px solid ${registration.payment_method === 'online' ? '#3b82f6' : '#f59e0b'};
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .payment-status h3 {
            color: ${registration.payment_method === 'online' ? '#1d4ed8' : '#d97706'};
            margin: 0 0 10px 0;
        }
        .list-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .list-box {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
        }
        .list-box h4 {
            color: #374151;
            margin: 0 0 15px 0;
            font-size: 16px;
        }
        .list-box ul {
            margin: 0;
            padding-left: 20px;
            color: #6b7280;
        }
        .list-box li {
            margin-bottom: 5px;
        }
        .info-box {
            background: #fef3c7;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-box.warning {
            background: #fef2f2;
            border-color: #fecaca;
        }
        .action-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            padding: 14px 20px;
            text-decoration: none;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
            transition: all 0.2s;
        }
        .button-primary {
            background: #16a34a;
            color: white;
        }
        .button-secondary {
            background: #f3f4f6;
            color: #374151;
            border: 2px solid #d1d5db;
        }
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #16a34a;
            text-decoration: none;
        }
        .footer-text {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.4;
        }
        @media (max-width: 600px) {
            .quick-details {
                grid-template-columns: 1fr;
            }
            .list-grid {
                grid-template-columns: 1fr;
            }
            .action-buttons {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">Appleton Drawing Club</div>
            <div class="tagline">Your creative community in the Fox Cities</div>
        </div>
        
        <div class="content">
            <div class="confirmation-box">
                <div class="confirmation-icon">🎨</div>
                <h2 style="color: #16a34a; margin: 0 0 10px 0;">You're All Set!</h2>
                <p style="margin: 0; font-size: 16px;">Hi ${registration.name}, you're registered for our upcoming event.</p>
                <p style="margin: 10px 0 0 0; font-weight: 600; color: #6b7280;">Confirmation ID: ${registration.id.slice(0, 8).toUpperCase()}</p>
            </div>
            
            ${event.image_url ? `
                <div class="event-hero">
                    <img src="${event.image_url}" alt="${event.title}" />
                </div>
            ` : ''}
            
            <div class="event-title">${event.title}</div>
            
            <div class="quick-details">
                <div class="quick-detail">
                    <div class="quick-detail-label">📅 DATE</div>
                    <div class="quick-detail-value">${formatDate(event.date)}</div>
                </div>
                <div class="quick-detail">
                    <div class="quick-detail-label">⏰ TIME</div>
                    <div class="quick-detail-value">${event.time}</div>
                </div>
                <div class="quick-detail">
                    <div class="quick-detail-label">📍 LOCATION</div>
                    <div class="quick-detail-value">${event.location}</div>
                </div>
                <div class="quick-detail">
                    <div class="quick-detail-label">💰 PRICE</div>
                    <div class="quick-detail-value">$${event.price}</div>
                </div>
            </div>
            
            <div class="action-buttons">
                <a href="${addToCalendarUrl}" class="button button-primary" target="_blank">
                    📅 Add to Calendar
                </a>
                <a href="${mapUrl}" class="button button-secondary" target="_blank">
                    🗺️ Get Directions
                </a>
            </div>
            
            <div class="payment-status">
                ${registration.payment_method === 'online' ? `
                    <h3>💳 Payment Confirmed</h3>
                    <p style="margin: 0;">Your payment of $${event.price} has been processed successfully. You're all set to attend!</p>
                ` : `
                    <h3>💰 Pay at the Door</h3>
                    <p style="margin: 0;">Please bring $${event.price} (cash or card) to pay when you arrive. We recommend arriving a few minutes early.</p>
                `}
            </div>
            
            <div class="section">
                <div class="section-title">
                    <span class="section-icon">📝</span>
                    Event Description
                </div>
                <p style="color: #6b7280; line-height: 1.6;">${event.description}</p>
            </div>
            
            ${event.model || event.instructor ? `
                <div class="section">
                    <div class="section-title">
                        <span class="section-icon">${event.event_type === 'workshop' ? '👩‍🏫' : '🎭'}</span>
                        ${event.event_type === 'workshop' ? 'Instructor' : 'Model'}
                    </div>
                    <p style="color: #6b7280;">${event.instructor || event.model}</p>
                </div>
            ` : ''}
            
            <div class="section">
                <div class="section-title">
                    <span class="section-icon">📦</span>
                    What to Bring & What We Provide
                </div>
                <div class="list-grid">
                    ${event.what_to_bring ? `
                        <div class="list-box">
                            <h4>✅ Please Bring:</h4>
                            <ul>
                                ${event.what_to_bring.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${event.what_we_provide ? `
                        <div class="list-box">
                            <h4>🎁 We'll Provide:</h4>
                            <ul>
                                ${event.what_we_provide.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">
                    <span class="section-icon">🚗</span>
                    Location & Parking
                </div>
                <p style="color: #6b7280; margin-bottom: 15px;"><strong>Address:</strong> ${event.address || event.location}</p>
                ${event.parking_info ? `<p style="color: #6b7280; margin-bottom: 10px;"><strong>Parking:</strong> ${event.parking_info}</p>` : ''}
                ${event.arrival_info ? `<p style="color: #6b7280;"><strong>Arrival:</strong> ${event.arrival_info}</p>` : ''}
            </div>
            
            ${event.special_notes ? `
                <div class="info-box">
                    <h4 style="color: #d97706; margin: 0 0 10px 0;">📌 Important Notes</h4>
                    <p style="margin: 0; color: #92400e;">${event.special_notes}</p>
                </div>
            ` : ''}
            
            <div class="section">
                <div class="section-title">
                    <span class="section-icon">ℹ️</span>
                    Good to Know
                </div>
                <div class="list-box">
                    <ul style="color: #6b7280;">
                        <li><strong>Refund Policy:</strong> ${event.refund_policy || 'Contact us for refund requests'}</li>
                        <li><strong>Questions?</strong> Email us at hello@appletondrawingclub.com</li>
                        <li><strong>Code of Conduct:</strong> We maintain a respectful, inclusive environment for all</li>
                        ${registration.newsletter_signup ? '<li><strong>Newsletter:</strong> You\'re subscribed to our updates</li>' : ''}
                    </ul>
                </div>
            </div>
            
            <div style="text-align: center; margin: 40px 0 20px 0;">
                <p style="font-size: 18px; color: #374151; margin-bottom: 15px;">Looking forward to creating with you!</p>
                <a href="mailto:hello@appletondrawingclub.com" class="button button-primary">
                    ✉️ Contact Us
                </a>
            </div>
        </div>
        
        <div class="footer">
            <div style="margin-bottom: 20px;">
                <strong style="color: #16a34a;">Appleton Drawing Club</strong><br>
                <span class="footer-text">Bringing together artists of all levels in the Fox Cities</span>
            </div>
            
            <div class="social-links">
                <a href="https://appletondrawingclub.com">🌐 Website</a>
                <a href="mailto:hello@appletondrawingclub.com">✉️ Email</a>
                <a href="https://instagram.com/appletondrawingclub">📸 Instagram</a>
            </div>
            
            <div class="footer-text">
                <p>This email was sent because you registered for an event with Appleton Drawing Club.</p>
                ${registration.newsletter_signup ? `
                    <p style="margin-top: 15px;">
                        You're subscribed to our newsletter. 
                        <a href="https://buttondown.email/appleton-drawing-club/unsubscribe" style="color: #6b7280;">Unsubscribe here</a>
                    </p>
                ` : ''}
            </div>
        </div>
    </div>
</body>
</html>`;

    // Enhanced text version
    const text = `
🎨 YOU'RE ALL SET FOR ${event.title.toUpperCase()}!

Hi ${registration.name},

Great news! You're registered for our upcoming event.
Confirmation ID: ${registration.id.slice(0, 8).toUpperCase()}

📅 EVENT DETAILS
${'-'.repeat(40)}
Event: ${event.title}
Date: ${formatDate(event.date)}
Time: ${event.time}
Location: ${event.location}
Address: ${event.address || event.location}
Price: $${event.price}

💰 PAYMENT STATUS
${registration.payment_method === 'online' 
    ? `✅ PAYMENT CONFIRMED: Your payment of $${event.price} has been processed.`
    : `💵 PAY AT DOOR: Please bring $${event.price} (cash or card) when you arrive.`
}

📝 ABOUT THIS EVENT
${event.description}

${event.model || event.instructor ? `
🎭 ${event.event_type === 'workshop' ? 'INSTRUCTOR' : 'MODEL'}: ${event.instructor || event.model}
` : ''}

${event.what_to_bring ? `
✅ PLEASE BRING:
${event.what_to_bring.map(item => `• ${item}`).join('\n')}
` : ''}

${event.what_we_provide ? `
🎁 WE'LL PROVIDE:
${event.what_we_provide.map(item => `• ${item}`).join('\n')}
` : ''}

🚗 LOCATION & PARKING
${event.parking_info ? `Parking: ${event.parking_info}` : ''}
${event.arrival_info ? `Arrival: ${event.arrival_info}` : ''}

${event.special_notes ? `
📌 IMPORTANT NOTES
${event.special_notes}
` : ''}

ℹ️ GOOD TO KNOW
• Refund Policy: ${event.refund_policy || 'Contact us for refund requests'}
• Questions? Email hello@appletondrawingclub.com
• Code of Conduct: We maintain a respectful, inclusive environment
${registration.newsletter_signup ? '• You\'re subscribed to our newsletter updates' : ''}

📅 Add to Calendar: ${addToCalendarUrl}
🗺️ Get Directions: ${mapUrl}

Looking forward to creating with you!

Appleton Drawing Club
https://appletondrawingclub.com
hello@appletondrawingclub.com
`;

    return { subject, html, text };
}
```

### 3. Create Database Migration for Enhanced Event Schema

Create a new Supabase migration to add the additional event fields:

```sql
-- Add enhanced event fields
ALTER TABLE events ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS what_to_bring TEXT[];
ALTER TABLE events ADD COLUMN IF NOT EXISTS what_we_provide TEXT[];
ALTER TABLE events ADD COLUMN IF NOT EXISTS parking_info TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS arrival_info TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS refund_policy TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS code_of_conduct_url TEXT;

-- Add some default values for existing events
UPDATE events SET 
    refund_policy = 'Refunds available up to 24 hours before the event. Contact hello@appletondrawingclub.com',
    code_of_conduct_url = 'https://appletondrawingclub.com/code-of-conduct'
WHERE refund_policy IS NULL;
```

### 4. Add Calendar File Generation (Optional Enhancement)

Create `netlify/functions/generate-calendar-event.js` for .ics file generation:
```javascript
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    const { registrationId } = event.queryStringParameters;
    
    // Fetch registration and event data
    // Generate .ics file content
    // Return as downloadable file
    
    // This is optional for ADC-06 but could be added later
};
```

## Testing Criteria
- [ ] Email includes all comprehensive event details
- [ ] Calendar links work correctly across different calendar apps
- [ ] Map links open correct location
- [ ] Email displays properly on mobile devices
- [ ] All conditional content displays correctly based on event type
- [ ] Payment status section shows correct information
- [ ] Social links and contact information are accurate
- [ ] Email loads images properly (when available)
- [ ] Text version includes all essential information
- [ ] Email renders correctly across email clients

## Files Created/Modified
- `netlify/functions/send-confirmation-email.js` - Enhanced email template with comprehensive details
- `src/routes/events/test-event/+page.svelte` - Updated with enhanced event data structure
- Supabase migration - Additional event fields for comprehensive information

## Next Steps
This completes the core registration flow! The next phase would include:
- Dynamic event management (create/edit events via admin interface)
- Event calendar display from database
- Admin registration dashboard
- Capacity limits and sold-out handling

## Success Metrics
After completing ADC-01 through ADC-06:
- ✅ Complete end-to-end registration flow working
- ✅ Both payment methods (online and door) functional  
- ✅ Professional email confirmations with all details
- ✅ User feedback for all scenarios (success, failure, cancelled)
- ✅ Single working event ready for real user testing
- ✅ Foundation ready to scale to multiple events