# ADC-12: Improve Webhook Reliability and Idempotency

## Overview
Implement robust webhook handling to prevent data loss from network failures, duplicate events, and out-of-order delivery.

## Current Issues
- No protection against duplicate webhook events
- Silent failures lose registration data permanently
- No retry mechanism for database failures
- No event ordering guarantees
- Missing idempotency safeguards

## Implementation Plan

### 1. Pending Registration Flow
**Problem**: Webhook failures lose registration data completely
**Solution**: Create registration upfront, update on payment completion

**Changes**:
- Modify registration form to create `pending` registration immediately
- Pass registration ID in Stripe checkout metadata
- Webhook updates existing record instead of creating new one
- Add cleanup job for abandoned pending registrations

### 2. Idempotency Protection
**Problem**: Duplicate webhooks create multiple registrations
**Solution**: Track processed events and use unique constraints

**Implementation**:
- Add `stripe_event_id` column to registrations table
- Check for existing event processing before handling
- Use database unique constraints to prevent duplicates
- Log duplicate event attempts for monitoring

### 3. Proper Error Handling
**Problem**: Database failures are silently ignored
**Solution**: Return appropriate HTTP status codes for Stripe retry logic

**Changes**:
- Return 500 status on database failures (triggers Stripe retry)
- Return 200 only on successful processing
- Implement exponential backoff for transient failures
- Add structured error logging

### 4. Event Status Tracking
**Problem**: No visibility into webhook processing status
**Solution**: Comprehensive event logging and status tracking

**Implementation**:
- Create `webhook_events` table to log all incoming events
- Track processing status: `pending`, `processing`, `completed`, `failed`
- Store event payload for debugging and replay capability
- Add admin dashboard for webhook monitoring

### 5. Reconciliation System
**Problem**: No way to recover from missed webhooks
**Solution**: Periodic sync between Stripe and local database

**Implementation**:
- Daily job to compare Stripe payments with local registrations
- Flag discrepancies for manual review
- Auto-fix obvious cases (completed payments with pending registrations)
- Alert system for unresolved conflicts

## Database Schema Changes

```sql
-- Add to registrations table
ALTER TABLE registrations ADD COLUMN stripe_event_id TEXT UNIQUE;
ALTER TABLE registrations ADD COLUMN registration_id UUID DEFAULT gen_random_uuid();

-- New webhook events table
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);
```

## Benefits
- **Zero data loss**: Pending registration flow prevents lost records
- **Duplicate protection**: Idempotency keys prevent double-processing
- **Automatic recovery**: Stripe retries failed webhooks automatically
- **Monitoring**: Full visibility into webhook processing health
- **Reconciliation**: Catch and fix any missed events
- **Debugging**: Event logs help troubleshoot issues

## Implementation Priority
1. **High**: Pending registration flow (prevents data loss)
2. **High**: Basic idempotency protection (prevents duplicates)
3. **Medium**: Error handling improvements (better retry behavior)
4. **Medium**: Event status tracking (monitoring and debugging)
5. **Low**: Reconciliation system (backup safety net)

## Files to Modify
- `src/lib/components/RegistrationForm.svelte` - Create pending registration
- `supabase/functions/register/index.ts` - Return registration ID to client
- `supabase/functions/stripe-webhook/index.ts` - Add idempotency and error handling
- Database migrations - Add new columns and tables
- `src/lib/types.ts` - Update registration status types

## Testing Strategy
- Test duplicate webhook delivery scenarios
- Simulate network failures during webhook processing
- Verify Stripe retry behavior with different HTTP status codes
- Test reconciliation job with known data discrepancies