export type CheckoutStatus = 'complete' | 'open' | 'expired' | 'unknown';

export interface CheckoutSessionData {
  id: string;
  status: CheckoutStatus;
  amount_total: number;
  metadata: {
    event_id?: string;
    event_title?: string;
    name?: string;
    email?: string;
    newsletter_signup?: string;
  };
  customer_email?: string;
  payment_status?: string;
  created?: number;
}

export interface CheckoutStatusResult {
  success: boolean;
  session?: CheckoutSessionData;
  error?: string;
}

/**
 * Retrieve and parse a Stripe checkout session from server
 */
export async function getCheckoutSession(sessionId: string): Promise<CheckoutStatusResult> {
  try {
    if (!sessionId) {
      return {
        success: false,
        error: 'No session ID provided'
      };
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!supabaseUrl || !supabasePublishableKey) {
      return {
        success: false,
        error: 'Missing Supabase configuration'
      };
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-checkout-session?session_id=${encodeURIComponent(sessionId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabasePublishableKey}`
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to retrieve checkout session'
      };
    }

    if (!result.session) {
      return {
        success: false,
        error: 'Session data not found'
      };
    }

    return {
      success: true,
      session: {
        id: result.session.id,
        status: mapStripeStatus(result.session.status),
        amount_total: result.session.amount_total || 0,
        metadata: result.session.metadata || {},
        customer_email: result.session.customer_email || undefined,
        payment_status: result.session.payment_status,
        created: result.session.created
      }
    };
  } catch (e) {
    console.error('Error retrieving checkout session:', e);
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error occurred'
    };
  }
}

/**
 * Map Stripe session status to our internal status type
 */
function mapStripeStatus(stripeStatus: string): CheckoutStatus {
  switch (stripeStatus) {
    case 'complete':
      return 'complete';
    case 'open':
      return 'open';
    case 'expired':
      return 'expired';
    default:
      return 'unknown';
  }
}

/**
 * Get user-friendly message for checkout status
 */
export function getStatusMessage(status: CheckoutStatus): {
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
} {
  switch (status) {
    case 'complete':
      return {
        type: 'success',
        title: 'Payment Successful!',
        message: 'Your registration has been confirmed and payment processed.'
      };
    case 'open':
      return {
        type: 'warning',
        title: 'Payment Not Completed',
        message: 'Your payment was not completed. You can try again or choose to pay at the door.'
      };
    case 'expired':
      return {
        type: 'error',
        title: 'Session Expired',
        message: 'Your checkout session has expired. Please start a new registration.'
      };
    default:
      return {
        type: 'error',
        title: 'Unknown Status',
        message: 'We couldn\'t determine your payment status. Please contact support.'
      };
  }
}

/**
 * Format price from cents to dollars
 */
export function formatPrice(amountInCents: number): string {
  return `$${(amountInCents / 100).toFixed(2)}`;
}

/**
 * Get next steps for user based on checkout status
 */
export function getNextSteps(status: CheckoutStatus): string[] {
  switch (status) {
    case 'complete':
      return [
        'Check your email for a confirmation receipt',
        'Save the event details to your calendar',
        'Bring your enthusiasm and drawing materials!'
      ];
    case 'open':
      return [
        'You can try the payment again',
        'Choose "Pay at Door" to reserve your spot',
        'Contact us if you need assistance'
      ];
    case 'expired':
      return [
        'Return to the event page to register again',
        'Your spot is not reserved until payment is complete'
      ];
    default:
      return [
        'Contact us at hello@appletondrawingclub.com',
        'Include your session ID in your message'
      ];
  }
}

/**
 * Check if status indicates successful payment
 */
export function isPaymentSuccessful(status: CheckoutStatus): boolean {
  return status === 'complete';
}

/**
 * Check if user can retry payment
 */
export function canRetryPayment(status: CheckoutStatus): boolean {
  return status === 'open' || status === 'expired';
}