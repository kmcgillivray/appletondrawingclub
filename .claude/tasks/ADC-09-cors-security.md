# ADC-09: CORS Security Improvements

## Overview
Implement secure CORS policy for Edge Functions that restricts access to legitimate origins while maintaining compatibility with Netlify deploy previews and local development.

## Current Security Issue
- **CORS Policy**: `'Access-Control-Allow-Origin': '*'` allows any website to call our Edge Functions
- **Risk Level**: Medium - vulnerable to cross-site abuse and resource exhaustion
- **Attack Vectors**: Malicious sites can embed our registration form, spam our endpoints, or harvest our API

## Solution Approach
Implement Netlify-aware origin validation that allows:
- ✅ Production domain (`appletondrawingclub.com`)
- ✅ Netlify main branch (`appletondrawingclub.netlify.app`) 
- ✅ Deploy previews (`deploy-preview-123--appletondrawingclub.netlify.app`)
- ✅ Local development (`localhost:*`)
- ❌ All other origins

## Technical Implementation

### Origin Validation Function
```typescript
// Add to supabase/functions/_shared/utils.ts

/**
 * Check if the request origin is allowed to access our Edge Functions
 * Supports production domain, Netlify previews, and local development
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  // Production domains
  if (origin === 'https://appletondrawingclub.com' || 
      origin === 'https://www.appletondrawingclub.com') {
    return true;
  }
  
  // Netlify main branch
  if (origin === 'https://appletondrawingclub.netlify.app') {
    return true;
  }
  
  // Netlify deploy previews (deploy-preview-123--appletondrawingclub.netlify.app)
  if (origin.endsWith('--appletondrawingclub.netlify.app') && 
      origin.includes('deploy-preview-')) {
    return true;
  }
  
  // Local development (localhost:3000, localhost:5173, etc.)
  if (origin.startsWith('http://localhost:') || 
      origin.startsWith('https://localhost:')) {
    return true;
  }
  
  return false;
}

/**
 * Get appropriate CORS headers based on request origin
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = isAllowedOrigin(origin);
  
  if (!isAllowed) {
    // Log rejected origin for monitoring
    console.log('CORS: Rejected origin:', origin);
  }
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin! : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'false'
  };
}
```

### Update Edge Functions
```typescript
// Update supabase/functions/register/index.ts

import { getCorsHeaders, isAllowedOrigin } from '../_shared/utils.ts'

Deno.serve(async (req): Promise<Response> => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // Reject requests from unauthorized origins
  if (!isAllowedOrigin(origin)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized origin' }), 
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // ... rest of function logic
  
  // Include CORS headers in all responses
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});
```

### Remove Old CORS Headers
```typescript
// Remove from supabase/functions/_shared/supabase.ts
// DELETE: export const corsHeaders = { ... }
```

## Implementation Steps

### Phase 1: Utility Functions
1. **Add origin validation function** to `_shared/utils.ts`
2. **Add CORS headers function** to `_shared/utils.ts`
3. **Add logging** for rejected origins
4. **Test utility functions** with various origin inputs

### Phase 2: Edge Function Updates  
5. **Update register function** to use new CORS logic
6. **Remove old corsHeaders export** from supabase.ts
7. **Add origin rejection logic** before processing requests
8. **Include CORS headers** in all responses

### Phase 3: Testing & Validation
9. **Test production domain** - verify requests succeed
10. **Test Netlify main branch** - verify requests succeed  
11. **Test deploy preview** - create preview and verify requests succeed
12. **Test localhost** - verify local development works
13. **Test unauthorized origin** - verify requests are rejected

### Phase 4: Monitoring & Deployment
14. **Deploy to Supabase** with new CORS logic
15. **Monitor Edge Function logs** for rejected origins
16. **Verify no legitimate traffic** is being blocked
17. **Document origin patterns** for future reference

## Testing Scenarios

### Valid Origins (Should Succeed)
- [ ] `https://appletondrawingclub.com`
- [ ] `https://www.appletondrawingclub.com`  
- [ ] `https://appletondrawingclub.netlify.app`
- [ ] `https://deploy-preview-123--appletondrawingclub.netlify.app`
- [ ] `http://localhost:5173`
- [ ] `http://localhost:3000`

### Invalid Origins (Should Fail)
- [ ] `https://evil-site.com`
- [ ] `https://appletondrawingclub.com.fake.com`
- [ ] `https://fake-appletondrawingclub.netlify.app`
- [ ] `https://deploy-preview-123--other-site.netlify.app`
- [ ] No origin header (null)

### Edge Cases
- [ ] HTTPS localhost (uncommon but possible)
- [ ] Different port numbers on localhost
- [ ] Malformed Netlify preview URLs
- [ ] Case sensitivity in domain matching

## Security Considerations

### What This Protects Against
- ✅ **Cross-site spam**: Prevents other sites from embedding our forms
- ✅ **Resource abuse**: Limits who can call our expensive Edge Functions  
- ✅ **API harvesting**: Makes it harder for attackers to discover/test our endpoints
- ✅ **CSRF-style attacks**: Reduces cross-origin request risks

### What This Doesn't Protect Against
- ❌ **Direct API calls**: Attackers can still use curl/Postman with spoofed origins
- ❌ **Sophisticated attacks**: Determined attackers can proxy through allowed origins
- ❌ **Internal threats**: Doesn't protect against compromised allowed domains

### Additional Recommendations
- Monitor rejected origins for attack patterns
- Consider rate limiting for additional protection
- Log successful requests from unexpected origins
- Review allowed origins periodically

## Deployment Strategy

### Safe Rollout Process
1. **Deploy with logging first** - don't reject yet, just log
2. **Monitor logs for 24 hours** - identify any legitimate traffic being blocked
3. **Adjust origin patterns** if needed based on logs
4. **Enable rejection** once confident in patterns
5. **Monitor error rates** after enabling rejection

### Rollback Plan
- Keep old CORS wildcard code commented out for quick rollback
- Monitor Edge Function error rates after deployment
- Be prepared to quickly revert if legitimate traffic is blocked

## Monitoring & Metrics

### Key Metrics to Track
- **Edge Function error rate** - shouldn't increase after deployment
- **Registration completion rate** - shouldn't decrease
- **Rejected origin frequency** - should see some rejections (spam attempts)
- **Deploy preview functionality** - ensure previews still work

### Logging Strategy
```typescript
// Log rejected origins for analysis
console.log('CORS: Rejected origin:', { 
  origin, 
  userAgent: req.headers.get('User-Agent'),
  timestamp: new Date().toISOString()
});

// Log allowed origins occasionally for verification
if (Math.random() < 0.01) { // 1% sampling
  console.log('CORS: Allowed origin:', origin);
}
```

## Environment Variables
No new environment variables needed - using hardcoded domain patterns for simplicity and security.

## Files to Modify
- `supabase/functions/_shared/utils.ts` - Add origin validation functions
- `supabase/functions/register/index.ts` - Implement CORS checking
- `supabase/functions/_shared/supabase.ts` - Remove old corsHeaders export

## Success Criteria
- ✅ Production site registration works normally  
- ✅ Deploy preview registration works normally
- ✅ Local development registration works normally
- ✅ Unauthorized origins receive 403 responses
- ✅ No increase in legitimate user error rates
- ✅ Edge Function logs show rejected spam origins

## Future Enhancements
- **Geographic restrictions**: Block origins from certain countries if spam patterns emerge
- **Referrer validation**: Additional validation based on referrer header
- **Rate limiting integration**: Combine with IP-based rate limiting
- **Automated origin management**: Dynamic allow-list based on deployment events