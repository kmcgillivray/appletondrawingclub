# ADC-07: Spam Protection for Registration Forms

## Overview

Implement spam protection measures for the event registration form to prevent automated submissions and abuse.

## Current State

- Registration form is publicly accessible via Edge Function
- Uses `--no-verify-jwt` deployment (appropriate for public registration)
- ✅ **Honeypot protection implemented** - Hidden "website" field validates against basic bot spam

## Spam Protection Options

### Quick Wins (Easy Implementation)

#### 1. Honeypot Field

**Effort**: Low  
**Effectiveness**: High against basic bots

✅ **IMPLEMENTED** - Hidden form field that legitimate users won't fill out, but bots will:

```svelte
<!-- In RegistrationForm.svelte -->
<input
  type="text"
  name="website"
  bind:value={website}
  style="position: absolute; left: -9999px; top: -9999px;"
  tabindex="-1"
  autocomplete="off"
  aria-hidden="true"
/>
```

```typescript
// In Edge Function validation
if (website) {
  console.log("Honeypot triggered:", { website });
  return jsonResponse({ error: "Invalid submission" }, 400);
}
```

#### 2. Rate Limiting

**Effort**: Low-Medium  
**Effectiveness**: High against spam waves

Options:

- **Edge Function level**: Track submissions by IP address
- **Netlify level**: Use Netlify's built-in rate limiting
- **Cloudflare level**: If using Cloudflare proxy

```typescript
// Simple IP-based rate limiting in Edge Function
const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
// Store recent submissions in memory or database
// Reject if too many recent submissions from same IP
```

#### 3. Input Validation

**Effort**: Low  
**Effectiveness**: Medium

- Email domain validation (block obvious fake domains)
- Name length and character validation
- Event ID validation (ensure it exists)

```typescript
// Enhanced validation
const suspiciousDomains = [
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
];
const emailDomain = email.split("@")[1];
if (suspiciousDomains.includes(emailDomain)) {
  return jsonResponse({ error: "Please use a valid email address" }, 400);
}

if (name.length < 2 || name.length > 100 || !/^[a-zA-Z\s'-]+$/.test(name)) {
  return jsonResponse({ error: "Please enter a valid name" }, 400);
}
```

### Medium Effort Solutions

#### 4. CAPTCHA Integration

**Effort**: Medium  
**Effectiveness**: Very High

Options:

- **hCaptcha**: Privacy-focused, GDPR compliant
- **reCAPTCHA**: Google's solution
- **Turnstile**: Cloudflare's CAPTCHA alternative

```svelte
<!-- Add to form -->
<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
<div class="h-captcha" data-sitekey="your-site-key"></div>
```

#### 5. Email Verification

**Effort**: Medium-High  
**Effectiveness**: High

- Send confirmation email before marking registration as active
- Prevents fake email addresses
- Requires email service integration (Supabase Auth, SendGrid, etc.)

#### 6. Duplicate Detection

**Effort**: Medium  
**Effectiveness**: Medium

```sql
-- Add unique constraint to prevent duplicates
ALTER TABLE registrations
ADD CONSTRAINT unique_email_event
UNIQUE (email, event_id);
```

```typescript
// Handle duplicate gracefully
if (regError?.code === "23505") {
  return jsonResponse(
    {
      error: "You have already registered for this event",
    },
    400
  );
}
```

### Advanced Solutions

#### 7. Behavioral Analysis

**Effort**: High  
**Effectiveness**: Very High

- Track form interaction patterns (time spent, mouse movements)
- Detect automated submission patterns
- Use services like Castle.io or similar

#### 8. Device Fingerprinting

**Effort**: High  
**Effectiveness**: High

- Track browser fingerprints to detect repeat offenders
- More complex to implement and privacy considerations

## Recommended Implementation Order

### Phase 1 (Immediate - Low Effort)

1. **Honeypot field** - ✅ **COMPLETED** - Added to form and validation
2. **Enhanced input validation** - Better email/name checking
3. **Duplicate prevention** - Database constraint + error handling

### Phase 2 (Short Term - Medium Effort)

4. **Rate limiting** - IP-based submission limits
5. **CAPTCHA** - Add hCaptcha or similar for suspicious submissions

### Phase 3 (Long Term - If Needed)

6. **Email verification** - If spam persists
7. **Behavioral analysis** - For sophisticated attacks

## Implementation Notes

### Database Changes

```sql
-- Add honeypot tracking (optional)
ALTER TABLE registrations ADD COLUMN submission_metadata JSONB;

-- Add rate limiting table (if doing DB-based rate limiting)
CREATE TABLE submission_attempts (
  ip_address INET,
  attempt_count INTEGER,
  window_start TIMESTAMP,
  PRIMARY KEY (ip_address)
);
```

### Environment Variables

```env
# For CAPTCHA
HCAPTCHA_SECRET_KEY=your_secret_key
VITE_HCAPTCHA_SITE_KEY=your_site_key

# For email verification (if implemented)
SENDGRID_API_KEY=your_api_key
```

### Monitoring

- Track spam attempt metrics
- Monitor false positive rates
- Set up alerts for spam waves

## Success Metrics

- Reduction in obviously fake registrations
- Maintained legitimate user conversion rate
- No significant impact on user experience

## Security Considerations

- Don't make validation too strict (false positives)
- Consider accessibility for CAPTCHA solutions
- GDPR compliance for any tracking/fingerprinting
- Regular review and adjustment of rules

## Files to Modify

- `src/lib/components/RegistrationForm.svelte` - Form updates
- `supabase/functions/register/index.ts` - Validation logic
- `supabase/functions/_shared/validation.ts` - New validation utilities
- Database schema - Constraints and tracking tables
