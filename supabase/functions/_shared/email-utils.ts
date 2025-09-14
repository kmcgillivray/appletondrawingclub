import { Resend } from "https://esm.sh/resend@3.2.0";
import { getRegistrationConfirmationEmail } from "./email-templates.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface SendRegistrationEmailParams {
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
}

export async function sendRegistrationConfirmationEmail(
  params: SendRegistrationEmailParams
) {
  try {
    const { registration, event } = params;

    // Generate email content using HTML template
    const { subject, html, text } = getRegistrationConfirmationEmail({
      registration,
      event,
    });

    const emailFrom =
      Deno.env.get("TRANSACTIONAL_FROM_EMAIL") ||
      "noreply@appletondrawingclub.com";

    const { data, error } = await resend.emails.send({
      from: `Appleton Drawing Club <${emailFrom}>`,
      to: [registration.email],
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Email send error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log("Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to send registration confirmation email:", error);
    throw error;
  }
}
