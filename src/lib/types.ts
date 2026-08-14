// Event-related types
export interface EventLocation {
  name: string;
  // Optional — preview cards show only the name; the detail page renders the
  // full address from Supabase. Omitted from src/lib/data/events.ts.
  address?: {
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
export type EventStatus =
  | "registration_open"
  | "completed"
  | "coming_soon"
  | "cancelled"
  | "sold_out";

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
  // Optional — used by the Supabase-sourced detail page (meta tags, JSON-LD,
  // "About this session"). Omitted from src/lib/data/events.ts preview data.
  summary?: string; // Short plain-text description for meta descriptions, etc.
  description?: string; // Detailed description, can contain markdown
  image_id?: string; // Cloudinary public_id, e.g. "ADC_Portrait_..._aukrnx"
  image_gravity?: "center" | "north" | "auto"; // Optional crop-focus override
  image_url?: string; // Legacy/full URL fallback (e.g. Supabase-sourced events)
  status?: EventStatus;
  // Optional link override — external URL or special internal route.
  // When omitted, the card links to `/events/${id}`.
  url?: string;
}

// Registration-related types (for ADC-02)
export type PaymentMethod = "door" | "online";
export type PaymentStatus = "pending" | "completed" | "refunded" | "cancelled";

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
  cancelled_at?: string;
  cancellation_reason?: string;
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
