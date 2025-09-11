# ADC-11: Add Stripe Customer Creation to Checkout Flow

## Overview
Implement Stripe customer creation for event registrations to improve analytics, fraud protection, and future-proof for user accounts.

## Current State
- Registration creates checkout sessions directly without customer association
- No customer tracking across multiple event registrations
- Limited analytics and refund context in Stripe dashboard

## Implementation Plan

### 1. Update Registration Edge Function
- Add customer lookup/creation logic before checkout session
- Check for existing customer by email: `stripe.customers.list({ email })`
- Create new customer if none exists: `stripe.customers.create({ email, name })`
- Pass `customer` parameter to checkout session creation

### 2. Database Schema Changes
- Add `stripe_customer_id` column to registrations table
- Store customer ID alongside registration data for easier reconciliation

### 3. Webhook Updates
- Extract customer ID from checkout session
- Store customer ID in registration record for future reference

### 4. Error Handling
- Graceful fallback if customer creation fails (proceed without customer)
- Log customer creation errors for monitoring

## Benefits
- **Analytics**: Track repeat attendees across events in Stripe dashboard
- **Fraud Protection**: Better ML model performance with customer context
- **Refunds**: Easier refund processing with customer history
- **Future-Proofing**: Ready for user accounts, memberships, subscriptions
- **Reconciliation**: Easier data validation between Stripe and database

## Technical Notes
- Use email as primary lookup key (no user auth yet)
- Customer creation adds minimal latency (~100ms API call)
- Backwards compatible - existing flow continues to work
- Sets foundation for membership features in future releases

## Files to Modify
- `supabase/functions/register/index.ts` - Add customer creation logic
- `supabase/functions/stripe-webhook/index.ts` - Store customer ID in registration
- Database migration - Add `stripe_customer_id` column

## Priority
Medium - Improves data quality and future-proofs architecture, but doesn't block current functionality.