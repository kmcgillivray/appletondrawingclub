/**
 * Buttondown newsletter integration utilities
 * Handles syncing email addresses to the newsletter subscriber list
 */

interface ButtondownSubscriberRequest {
  email_address: string;
  type: 'regular';
}

interface ButtondownErrorResponse {
  code?: string;
  detail?: string;
}

/**
 * Sync an email address to the Buttondown newsletter
 * Handles all error scenarios gracefully to avoid blocking registration
 *
 * @param email - The email address to subscribe
 * @returns Promise<boolean> - true if successful, false if failed (but non-blocking)
 */
export async function syncToNewsletter(email: string): Promise<boolean> {
  const apiKey = Deno.env.get('BUTTONDOWN_API_KEY');

  if (!apiKey) {
    console.error('Newsletter sync failed: BUTTONDOWN_API_KEY not configured');
    return false;
  }

  if (!email) {
    console.error('Newsletter sync failed: No email address provided');
    return false;
  }

  try {
    const requestBody: ButtondownSubscriberRequest = {
      email_address: email,
      type: 'regular'
    };

    const response = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      console.log('Newsletter sync successful', { email });
      return true;
    }

    // Handle specific error cases
    const errorData: ButtondownErrorResponse = await response.json().catch(() => ({}));

    if (response.status === 400 && errorData.code === 'email_already_exists') {
      console.log('Newsletter sync: Email already subscribed', { email });
      return true; // Consider this a success - user is already subscribed
    }

    if (response.status === 400 && errorData.code === 'email_blocked') {
      console.warn('Newsletter sync: Email is blocked', { email });
      return false;
    }

    if (response.status === 400 && errorData.code === 'email_invalid') {
      console.error('Newsletter sync: Invalid email format', { email });
      return false;
    }

    if (response.status === 429 || errorData.code === 'rate_limited') {
      console.warn('Newsletter sync: Rate limited by Buttondown API', { email });
      return false;
    }

    // Generic error handling
    console.error('Newsletter sync failed', {
      email,
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    return false;

  } catch (error) {
    console.error('Newsletter sync network error', { email, error: String(error) });
    return false;
  }
}