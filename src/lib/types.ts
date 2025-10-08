// Event-related types
export interface EventLocation {
  name: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
  };
}

export type EventType =
  | "figure_drawing"
  | "portrait"
  | "workshop"
  | "special_event";
export type EventStatus = "registration_open" | "completed" | "coming_soon";

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  doors_open?: string;
  location: EventLocation;
  model?: string;
  instructor?: string;
  session_leader?: string;
  price: number;
  capacity?: number;
  event_type: EventType;
  special_notes?: string;
  summary: string; // Short plain-text description for previews, meta descriptions, etc.
  description: string; // Detailed description, can contain markdown
  image_url?: string;
  status?: EventStatus;
  url?: string;
}

// Registration-related types (for ADC-02)
export type PaymentMethod = "door" | "online";
export type PaymentStatus = "pending" | "completed" | "refunded";

export interface Registration {
  id: string;
  event_id: string;
  name: string;
  email: string;
  quantity: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  newsletter_signup: boolean;
  created_at: string;
  refunded_at?: string;
  refund_reason?: string;
  refund_amount?: number;
  stripe_refund_id?: string;
}

// Form types for registration
export interface RegistrationFormData {
  name: string;
  email: string;
  quantity: number;
  newsletter_signup: boolean;
}

// API response types
export interface RegistrationResponse {
  success: boolean;
  registration?: Registration;
  error?: string;
}
