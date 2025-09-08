# ADC-10: Testing Strategy Implementation

## Overview
Implement comprehensive testing strategy for the Appleton Drawing Club website, focusing on the registration system's critical functionality while ensuring overall code quality and reliability.

## Current State
- No automated testing infrastructure
- Registration system relies on manual testing
- Edge Functions and form validation lack test coverage
- TypeScript provides compile-time safety but no runtime validation testing

## Testing Architecture

### Test Types & Frameworks

#### 1. Unit Testing
**Framework**: Vitest
**Purpose**: Test individual functions and utilities in isolation
**Coverage**:
- Validation functions (email format, required fields)
- Utility functions (markdown rendering, date formatting)
- Edge Function business logic
- Type validation and error handling

#### 2. Component Testing  
**Framework**: Testing Library + Vitest
**Purpose**: Test Svelte components and user interactions
**Coverage**:
- `RegistrationForm.svelte` behavior and validation
- Form state management and error displays
- Event card rendering and data display
- User interaction flows

#### 3. Integration Testing
**Framework**: Playwright
**Purpose**: End-to-end testing of complete user workflows
**Coverage**:
- Full registration flow from form to database
- Anti-spam protection validation
- Error handling and user feedback
- Cross-browser compatibility

#### 4. API Testing
**Framework**: Vitest with native fetch
**Purpose**: Test Edge Functions and API endpoints
**Coverage**:
- Registration endpoint validation
- Database operations and RLS policies
- CORS and security implementations
- Error response handling

## Implementation Plan

### Phase 1: Foundation & Unit Tests

#### 1.1 Setup Test Environment
```bash
# Install testing dependencies
npm install -D vitest @testing-library/svelte @testing-library/jest-dom
npm install -D @playwright/test jsdom happy-dom
```

#### 1.2 Configure Vitest
```javascript
// vitest.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
});
```

#### 1.3 Create Shared Test Utils
```typescript
// src/test/setup.ts - Test environment setup
// src/test/factories.ts - Test data factories
// src/test/mocks.ts - API and Supabase mocks
```

#### 1.4 Unit Tests for Validation Logic
**Priority Tests**:
- Email validation regex and edge cases
- Honeypot detection logic
- Required field validation
- Markdown rendering with XSS protection
- Date formatting and parsing

### Phase 2: Component Testing

#### 2.1 RegistrationForm Component Tests
**Test Scenarios**:
- Form renders with correct fields
- Validation errors display properly
- Honeypot field is hidden but functional
- Loading states work correctly
- Success/error messages display
- Form submission calls correct API

#### 2.2 Event Display Components
**Test Scenarios**:
- Event data renders correctly
- Markdown content processes safely
- Price and date formatting
- Registration button states

### Phase 3: Integration Testing

#### 3.1 End-to-End Registration Flow
**Playwright Test Scenarios**:
- User can complete successful registration
- Spam protection blocks bot submissions
- Error handling displays appropriate messages
- Registration data persists to database
- Email validation works in real browsers

#### 3.2 Cross-Browser Testing
**Target Browsers**:
- Chrome (desktop & mobile)
- Firefox (desktop)
- Safari (desktop & mobile)
- Edge (desktop)

### Phase 4: API Testing

#### 4.1 Edge Function Tests
**Test Scenarios**:
- Valid registration requests succeed
- Invalid data returns proper errors
- Honeypot validation blocks spam
- CORS headers work correctly
- Database operations succeed
- RLS policies enforce security

#### 4.2 Mock Supabase for Testing
```typescript
// Mock Supabase client for testing
const mockSupabase = {
  from: () => ({
    insert: vi.fn().mockResolvedValue({ data: mockRegistration }),
    select: vi.fn().mockResolvedValue({ data: [mockRegistration] })
  })
};
```

## Test File Structure

```
src/
├── test/
│   ├── setup.ts              # Test environment setup
│   ├── factories.ts          # Test data factories
│   └── mocks.ts             # API mocks and fixtures
├── lib/
│   ├── components/
│   │   ├── RegistrationForm.test.ts
│   │   └── EventCard.test.ts
│   ├── utils/
│   │   ├── validation.test.ts
│   │   ├── markdown.test.ts
│   │   └── events.test.ts
│   └── types.test.ts        # Type validation tests
tests/
├── e2e/
│   ├── registration.spec.ts  # End-to-end registration tests
│   ├── spam-protection.spec.ts
│   └── error-handling.spec.ts
└── api/
    ├── registration-endpoint.test.ts
    └── edge-functions.test.ts

supabase/functions/register/
└── index.test.ts            # Edge Function unit tests
```

## Testing Data & Mocks

### Test Data Factories
```typescript
// Test event data
export const createMockEvent = (overrides = {}) => ({
  id: 'test-event',
  title: 'Test Drawing Session',
  date: '2024-12-01',
  summary: 'Test event summary',
  description: 'Test event description',
  price: 15,
  ...overrides
});

// Test registration data
export const createMockRegistration = (overrides = {}) => ({
  name: 'John Doe',
  email: 'john@example.com',
  newsletter_signup: false,
  website: '', // Honeypot field
  ...overrides
});
```

### Mock Implementations
```typescript
// Mock Supabase Edge Function environment
vi.mock('../_shared/supabase', () => ({
  createSupabaseClient: () => mockSupabaseClient
}));

// Mock fetch for API testing
global.fetch = vi.fn();
```

## Test Scripts & CI Integration

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

### GitHub Actions CI
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: npx playwright install
      - run: npm run test:e2e
```

## Critical Test Scenarios

### Registration Form Validation
- [ ] **Email format validation** - Valid/invalid email formats
- [ ] **Required field validation** - Missing name, email, etc.
- [ ] **Honeypot protection** - Hidden field filled by bots
- [ ] **Form submission** - Successful registration flow
- [ ] **Error handling** - Network errors, validation failures
- [ ] **Loading states** - Button disabled during submission

### Edge Function Security
- [ ] **Input sanitization** - XSS and injection attempts
- [ ] **CORS validation** - Allowed/blocked origins
- [ ] **Rate limiting** - Multiple rapid requests (future)
- [ ] **Database operations** - RLS policy enforcement
- [ ] **Error responses** - Proper HTTP status codes

### Anti-Spam Protection
- [ ] **Honeypot detection** - Bot submissions blocked
- [ ] **Validation bypass attempts** - Direct API calls
- [ ] **Edge case inputs** - Malformed data handling

### User Experience
- [ ] **Form accessibility** - Screen reader compatibility
- [ ] **Mobile responsiveness** - Touch interactions
- [ ] **Error message clarity** - User-friendly messages
- [ ] **Success feedback** - Clear confirmation

## Coverage Goals

### Minimum Coverage Targets
- **Unit Tests**: 80% code coverage for utilities and validation
- **Component Tests**: 70% coverage for interactive components  
- **Integration Tests**: 100% coverage of critical user paths
- **API Tests**: 90% coverage of Edge Function endpoints

### Quality Metrics
- All tests pass consistently
- No flaky tests (tests that randomly fail)
- Fast test execution (< 30 seconds for unit tests)
- Clear test failure messages

## Maintenance Strategy

### Test Maintenance
- **Update tests** when adding new features
- **Review failing tests** immediately, don't ignore
- **Refactor tests** when component APIs change
- **Monitor coverage** to catch untested code paths

### Performance Monitoring
- **Test execution time** - Keep tests fast
- **CI pipeline duration** - Optimize for developer productivity
- **Coverage trends** - Maintain or improve coverage over time

## Tools & Dependencies

### Core Testing Framework
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/svelte": "^4.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@playwright/test": "^1.40.0",
    "jsdom": "^23.0.0",
    "c8": "^8.0.0"
  }
}
```

### Additional Utilities
- **MSW** - Mock Service Worker for API mocking (if needed)
- **Faker.js** - Generate realistic test data
- **Visual regression** - Chromatic or Percy (future consideration)

## Security Testing Considerations

### Input Validation Tests
- SQL injection attempts
- XSS payload attempts  
- CSRF token validation (if implemented)
- File upload security (future features)

### Authentication & Authorization
- Service role policy enforcement
- Unauthorized access attempts
- Token validation and expiry

## Documentation Requirements

### Test Documentation
- **README section** explaining how to run tests
- **Test naming conventions** for consistency
- **Mock data guidelines** for maintainable tests
- **Debugging failing tests** troubleshooting guide

### Developer Guidelines  
- **TDD practices** - Write tests before implementation
- **Test organization** - Group related tests logically
- **Assertion best practices** - Clear, specific assertions
- **Test isolation** - Each test should be independent

## Success Metrics

### Implementation Success
- [ ] All critical registration flows have test coverage
- [ ] Tests run reliably in CI/CD pipeline
- [ ] Developers can run tests locally easily
- [ ] Test failures provide actionable information
- [ ] Codebase has measurable quality improvement

### Long-term Benefits
- **Reduced bugs** in production registration system
- **Faster development** with confidence in changes
- **Better documentation** through test examples
- **Easier refactoring** with test safety net

## Future Enhancements

### Advanced Testing (Phase 2)
- **Performance testing** - Load testing registration endpoint
- **Accessibility testing** - Automated a11y validation  
- **Visual regression** - UI consistency across changes
- **Security scanning** - Automated vulnerability detection

### Test Automation
- **Mutation testing** - Verify test effectiveness
- **Contract testing** - API contract validation
- **Database testing** - Migration and schema validation