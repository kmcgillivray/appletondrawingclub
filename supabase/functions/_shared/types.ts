// Registration-related types for Edge Functions
export interface RegistrationRequest {
  event_id: string;
  name: string;
  email: string;
  quantity: number; // Number of people (1-6)
  payment_method: string;
  newsletter_signup: boolean;
  processing_status?: string; // For creating pending registrations
  website?: string; // Honeypot field - should be empty for legitimate users
}

export interface Registration {
  id: string;
  event_id: string;
  name: string;
  email: string;
  quantity: number;
  payment_method: string;
  payment_status: string;
  newsletter_signup: boolean;
  stripe_customer_id: string;
  stripe_event_id?: string;
  stripe_session_id?: string;
  processing_status: string;
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