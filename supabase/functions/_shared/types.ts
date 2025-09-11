// Registration-related types for Edge Functions
export interface RegistrationRequest {
  event_id: string;
  name: string;
  email: string;
  payment_method: string;
  newsletter_signup: boolean;
  website?: string; // Honeypot field - should be empty for legitimate users
}

export interface Registration {
  id: string;
  event_id: string;
  name: string;
  email: string;
  payment_method: string;
  payment_status: string;
  newsletter_signup: boolean;
  stripe_customer_id: string;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RegistrationResponse extends ApiResponse<Registration> {
  registration?: Registration;
}