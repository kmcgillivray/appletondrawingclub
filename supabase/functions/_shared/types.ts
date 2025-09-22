import { Database } from "./database.types.ts";

// Registration-related types for Edge Functions
export interface RegistrationRequest {
  event_id: string;
  name: string;
  email: string;
  quantity: number; // Number of people (1-6)
  payment_method: string;
  newsletter_signup: boolean;
  website?: string; // Honeypot field - should be empty for legitimate users
  donation_amount?: number; // Optional donation amount in dollars
}

export type Registration = Database["public"]["Tables"]["registrations"]["Row"];

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RegistrationResponse extends ApiResponse<Registration> {
  registration?: Registration;
}
