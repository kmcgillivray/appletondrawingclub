# ADC-15: Newsletter Integration

## Overview
Integrate Buttondown newsletter subscription into the existing registration flow. When users opt-in to the newsletter during event registration, automatically sync their email to the Buttondown subscriber list.

## Current State
- Registration system captures `newsletter_signup` boolean field ✅
- Both payment flows (door/online) collect newsletter preference ✅
- Field is stored in database but no integration exists ❌

## Requirements

### Core Integration
1. **Create Buttondown API Client** (`supabase/functions/_shared/buttondown.ts`)
   - POST to `https://api.buttondown.com/v1/subscribers`
   - Handle authentication with API key
   - Manage rate limiting (100 requests/hour)
   - Error handling for duplicates, invalid emails, blocked emails

2. **Enhance Registration Flow** (`supabase/functions/register/index.ts`)
   - Add newsletter sync after successful registration (line ~180)
   - Only sync when `newsletter_signup = true`
   - Handle failures gracefully (don't block registration)
   - Log integration results for debugging

3. **Environment Setup**
   - Add `BUTTONDOWN_API_KEY` to Edge Functions environment
   - Update `.env.example` documentation

### API Integration Details
- **Endpoint**: `https://api.buttondown.com/v1/subscribers`
- **Method**: POST
- **Headers**:
  - `Authorization: Token $BUTTONDOWN_API_KEY`
  - `Content-Type: application/json`
- **Body**: `{ "email_address": "user@example.com", "type": "regular" }`

### Error Handling Strategy
- **Success**: Log successful subscription
- **Duplicate Email**: Log but continue (user already subscribed)
- **Invalid Email**: Log error but continue (registration validated email)
- **Rate Limited**: Log error and continue (avoid blocking registration)
- **Network/API Error**: Log error and continue (don't fail registration)

## Implementation Tasks

### Phase 1: Core Integration
1. Create `supabase/functions/_shared/buttondown.ts`
   - Export `syncToNewsletter(email: string)` function
   - Handle all Buttondown API communication
   - Implement proper error handling and logging

2. Update `supabase/functions/register/index.ts`
   - Import and call newsletter sync function
   - Add after line ~179 (after email confirmation logic)
   - Only execute when `newsletter_signup === true`

3. Update environment configuration
   - Add `BUTTONDOWN_API_KEY` to `supabase/functions/.env.example`
   - Document API key setup process

### Phase 2: Testing & Documentation
1. Test integration with various scenarios
   - New subscriber signup
   - Duplicate email handling
   - API error conditions
   - Rate limiting behavior

2. Update project documentation
   - Add newsletter integration section to CLAUDE.md
   - Document environment setup requirements

## Technical Considerations

### Security
- API key stored securely in Edge Functions environment
- No client-side exposure of Buttondown credentials
- Validate email format before API calls

### Performance
- Async operation doesn't block registration completion
- Rate limiting handled gracefully
- Minimal impact on registration response time

### Monitoring
- Log all newsletter sync attempts
- Track success/failure rates
- Monitor for rate limit issues

## Acceptance Criteria
- [ ] Users who check newsletter opt-in are added to Buttondown
- [ ] Registration completes successfully even if newsletter sync fails
- [ ] Duplicate email handling works correctly
- [ ] API errors are logged but don't affect registration
- [ ] Environment setup documented
- [ ] Integration tested with various scenarios

## Related Files
- `supabase/functions/register/index.ts` (line 34: newsletter_signup capture, line ~180: integration point)
- `src/lib/components/RegistrationForm.svelte` (line 198-207: newsletter checkbox)
- `src/lib/types.ts` (line 48: newsletter_signup field definition)

## Dependencies
- Buttondown API key configuration
- No additional npm packages required (using fetch)
