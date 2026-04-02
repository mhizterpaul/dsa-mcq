# Documentation: learning.acceptance.test.ts

## Feature: Learning Route Acceptance Tests > Authentication

### Scenario: featured-categories rejects unauthenticated requests

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > Authentication

### Scenario: questions rejects unauthenticated requests

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > Authentication

### Scenario: rejects expired session in DB

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > Authentication

### Scenario: rejects session-user mismatch

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > Authentication

### Scenario: rejects invalid JWT signature

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > Authentication

### Scenario: rejects expired JWT token (exp claim)

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > GET /api/learning/featured-categories

### Scenario: returns only featured categories with question counts

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > GET /api/learning/featured-categories

### Scenario: returns categories in deterministic order (name asc)

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > GET /api/learning/featured-categories

### Scenario: returns empty array when no featured categories exist

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > GET /api/learning/featured-categories

### Scenario: returns 405 for POST to featured-categories

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > GET /api/learning/featured-categories

### Scenario: returns 405 for DELETE to featured-categories

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > POST /api/learning/questions

### Scenario: returns formatted questions for given IDs

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > POST /api/learning/questions

### Scenario: returns 400 if ids is not an array

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > POST /api/learning/questions

### Scenario: returns empty array for empty ids

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > POST /api/learning/questions

### Scenario: ignores non-existent ids

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > POST /api/learning/questions

### Scenario: handles duplicate ids

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > POST /api/learning/questions

### Scenario: returns questions in deterministic order (id asc)

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > POST /api/learning/questions

### Scenario: rejects invalid id types

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > POST /api/learning/questions

### Scenario: enforces maximum 50 questions limit

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > GET /api/learning/questions

### Scenario: returns formatted questions by category and difficulty

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > GET /api/learning/questions

### Scenario: returns 400 for invalid difficulty

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > GET /api/learning/questions

### Scenario: returns 400 for missing categoryId

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > GET /api/learning/questions

### Scenario: returns 405 for PUT to questions

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > GET /api/learning/questions

### Scenario: returns 405 for DELETE to questions

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > GET /api/learning/questions

### Scenario: returns empty array when no questions match filter

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > GET /api/learning/questions

### Scenario: does not include isCorrect by default (security hardening)

- Status: ✅ passed

## Feature: Learning Route Acceptance Tests > GET /api/learning/questions

### Scenario: returns empty array when category has zero questions

- Status: ✅ passed
