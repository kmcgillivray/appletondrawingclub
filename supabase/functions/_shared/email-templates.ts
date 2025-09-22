interface RegistrationEmailData {
  registration: {
    id: string;
    name: string;
    email: string;
    quantity: number;
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
    special_notes: string | null;
  };
  donation_amount?: number;
}

export function getRegistrationConfirmationEmail(data: RegistrationEmailData) {
  const { registration, event, donation_amount } = data;
  const confirmationId = registration.id.slice(0, 8);
  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasDonation = donation_amount && donation_amount > 0;
  const eventTotal = event.price * registration.quantity;
  const grandTotal = eventTotal + (hasDonation ? donation_amount : 0);

  const subject = `Registration Confirmed: ${event.title}`;

  // Professional HTML template with Appleton Drawing Club branding
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
  <p><strong>Location:</strong> ${event.location.name}, ${
    event.location.address
  }</p>
  <p><strong>Quantity:</strong> ${registration.quantity} ${
    registration.quantity === 1 ? "person" : "people"
  }</p>
  <p><strong>Event Fee:</strong> $${event.price} per person (Total: $${eventTotal})</p>
  ${
    hasDonation
      ? `<p><strong>REGI Wildlife Rescue Donation:</strong> $${donation_amount}</p>
  <p><strong>Total Payment:</strong> $${grandTotal}</p>`
      : ""
  }
  
  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p><strong>Payment:</strong> ${
      registration.payment_method === "online"
        ? `Payment complete - you're all set!${
            hasDonation
              ? ` Thank you for your additional $${donation_amount} donation to REGI wildlife rescue!`
              : ""
          }`
        : `Please bring $${eventTotal} (cash) to pay at the door.`
    }</p>
  </div>
  
  ${
    event.special_notes
      ? `
  <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p><strong>Important:</strong> ${event.special_notes}</p>
  </div>
  `
      : ""
  }
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  
  <p>Questions? Just reply to this email, or <a href="https://appletondrawingclub.com/contact">contact us here</a>.</p>
  
  <p style="font-size: 14px; color: #666;">
    Appleton Drawing Club<br>
    <a href="https://appletondrawingclub.com">appletondrawingclub.com</a>
  </p>

</body>
</html>`;

  // Plain text version for email client compatibility
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
Quantity: ${registration.quantity} ${
    registration.quantity === 1 ? "person" : "people"
  }
Event Fee: $${event.price} per person (Total: $${eventTotal})${
    hasDonation
      ? `
REGI Wildlife Rescue Donation: $${donation_amount}
Total Payment: $${grandTotal}`
      : ""
  }

${
  registration.payment_method === "online"
    ? `PAYMENT COMPLETE: Your payment of $${grandTotal} has been processed. You're all set!${
        hasDonation
          ? ` Thank you for your additional $${donation_amount} donation to REGI wildlife rescue!`
          : ""
      }`
    : `PAY AT DOOR: Please bring $${eventTotal} (cash) to pay when you arrive at the event.`
}

${event.special_notes ? `IMPORTANT NOTES: ${event.special_notes}` : ""}

Questions? Just reply to this email or contact us at https://appletondrawingclub.com/contact

Appleton Drawing Club
https://appletondrawingclub.com
  `.trim();

  return { subject, html, text };
}
