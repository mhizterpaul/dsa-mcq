# Documentation: dailyQuiz.acceptance.test.ts

### sessions endpoint rejects unauthenticated requests

- ❌ failed

### answer endpoint rejects unauthenticated requests

- ❌ failed

### exit endpoint rejects unauthenticated requests

- ❌ failed

### results endpoint rejects unauthenticated requests

- ❌ failed

## Feature: Daily Quiz Acceptance Tests (Real DB) > Security & Authorization

### Scenario: should reject

- **Given**: expired tokens
- **Then**: reject

## Feature: Daily Quiz Acceptance Tests (Real DB) > Session Matching & Capacity

### Scenario: should match users

- **Given**: similar achievements
- **Then**: match users

## Feature: Daily Quiz Acceptance Tests (Real DB) > Session Matching & Capacity

### Scenario: should enforce capacity limits atomically

- **Given**: multiple joins
- **Then**: enforce capacity limits atomically

## Feature: Daily Quiz Acceptance Tests (Real DB) > Timer Integrity & Answer Handling

### Scenario: should reject answers

- **Given**: 5 minute timeout
- **Then**: reject answers

## Feature: Daily Quiz Acceptance Tests (Real DB) > Timer Integrity & Answer Handling

### Scenario: should prevent duplicate answers

- **Given**: repeated submission
- **Then**: prevent duplicate answers

## Feature: Daily Quiz Acceptance Tests (Real DB) > Results Calculation

### Scenario: should compute correct rankings and xp

- **Given**: finished session
- **Then**: compute correct rankings and xp

## Feature: Daily Quiz Acceptance Tests (Real DB) > Polling & State Synchronization

### Scenario: should isolate updates

- **Given**: different sessions
- **Then**: isolate updates

## Feature: Daily Quiz Acceptance Tests (Real DB) > Polling & State Synchronization

### Scenario: should reflect session availability

- **Given**: server load
- **Then**: reflect session availability
