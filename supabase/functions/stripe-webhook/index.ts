import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createSupabaseClient } from '../_shared/supabase.ts'
import { jsonResponse, handleCors } from '../_shared/utils.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

Deno.serve(async (req): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCors()
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing stripe signature', { status: 400 })
  }

  let stripeEvent: Stripe.Event

  try {
    const body = await req.text()
    stripeEvent = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Handle the event
  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(stripeEvent.data.object as Stripe.Checkout.Session)
      break
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(stripeEvent.data.object as Stripe.PaymentIntent)
      break
    default:
      console.log(`Unhandled event type ${stripeEvent.type}`)
  }

  return new Response('Success', { status: 200 })
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const supabase = createSupabaseClient()
    const { event_id, event_title, name, email, newsletter_signup, customer_id } = session.metadata || {}

    // Get customer ID from session (prefer metadata, fallback to session customer)
    const stripeCustomerId = customer_id || session.customer as string

    if (!event_id || !name || !email || !stripeCustomerId) {
      console.error('Missing required data in checkout session:', {
        event_id: !!event_id,
        name: !!name,
        email: !!email,
        stripeCustomerId: !!stripeCustomerId
      })
      return
    }

    console.log('Creating registration for:', { event_id, name, email, stripeCustomerId })

    // Create registration record
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert([{
        event_id,
        name,
        email,
        payment_method: 'online',
        payment_status: 'completed',
        newsletter_signup: newsletter_signup === 'true',
        stripe_customer_id: stripeCustomerId
      }])
      .select()
      .single()

    if (regError) {
      console.error('Failed to create registration:', regError)
      return
    }

    console.log('Registration created successfully:', registration.id)
    
    // TODO: Send confirmation email (will be implemented in ADC-05)
    
  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error('Payment failed for intent:', paymentIntent.id)
  // TODO: Handle payment failure notifications
}