# Documentation: user.acceptance.test.ts

## Feature: User Acceptance Tests (Real DB) > Authentication & Authorization

### Scenario: rejects expired JWT

- Status: ✅ passed

## Feature: User Acceptance Tests (Real DB) > Authentication & Authorization

### Scenario: rejects malformed JWT

- Status: ✅ passed

## Feature: User Acceptance Tests (Real DB) > Authentication & Authorization

### Scenario: rejects token with invalid sessionId

- Status: ✅ passed

## Feature: User Acceptance Tests (Real DB) > GET /api/user/profile-summary

### Scenario: Retrieves essential user profile data for the dashboard

> 🔗 **API Route**: `/api/user/profile-summary`

- Status: ✅ passed

## Feature: User Acceptance Tests (Real DB) > GET /api/user/profile-summary

### Scenario: returns 405 for invalid methods

- Status: ✅ passed

## Feature: User Acceptance Tests (Real DB) > PUT /api/user/profile

### Scenario: Allows users to update their profile information and preferences

> 🔗 **API Route**: `/api/user/profile`

- Status: ✅ passed

## Feature: User Acceptance Tests (Real DB) > PUT /api/user/profile

### Scenario: handles partial updates

- Status: ✅ passed

## Feature: User Acceptance Tests (Real DB) > POST /api/user/profile-picture

### Scenario: Uploads and updates the user's avatar image

> 🔗 **API Route**: `/api/user/profile-picture`

- Status: ✅ passed

## Feature: User Acceptance Tests (Real DB) > POST /api/user/profile-picture

### Scenario: returns 400 for missing file

- Status: ✅ passed

## Feature: User Acceptance Tests (Real DB) > POST /api/user/settings

### Scenario: updates settings and validates persistence

- Status: ✅ passed

## Feature: User Acceptance Tests (Real DB) > POST /api/user/settings

### Scenario: returns 400 for invalid setting value type

- Status: ✅ passed
