# Documentation: dailyQuiz.acceptance.test.ts

## Feature: Daily Quiz Acceptance Tests (Real DB) > Security & Authorization

### Scenario: sessions endpoint rejects unauthenticated requests

- Status: ✅ passed

## Feature: Daily Quiz Acceptance Tests (Real DB) > Security & Authorization

### Scenario: answer endpoint rejects unauthenticated requests

- Status: ✅ passed

## Feature: Daily Quiz Acceptance Tests (Real DB) > Security & Authorization

### Scenario: exit endpoint rejects unauthenticated requests

- Status: ✅ passed

## Feature: Daily Quiz Acceptance Tests (Real DB) > Security & Authorization

### Scenario: results endpoint rejects unauthenticated requests

- Status: ✅ passed

## Feature: Daily Quiz Acceptance Tests (Real DB) > Security & Authorization

### Scenario: Rejects requests with expired session tokens

> 🔗 **API Route**: `/api/daily-quiz/sessions`

- **Given**: expired tokens
- **Then**: reject

## Feature: Daily Quiz Acceptance Tests (Real DB) > Session Matching & Capacity

### Scenario: Match users with compatible leaderboard stats

- **Given**: similar achievements
- **Then**: match users

## Feature: Daily Quiz Acceptance Tests (Real DB) > Session Matching & Capacity

### Scenario: should enforce capacity limits atomically given multiple joins

- **Given**: multiple joins
- **Then**: enforce capacity limits atomically

## Feature: Daily Quiz Acceptance Tests (Real DB) > Timer Integrity & Answer Handling

### Scenario: Enforces a strict 5-minute time limit for quiz submissions

> 🔗 **API Route**: `/api/daily-quiz/answer`

- **Given**: 5 minute timeout
- **Then**: reject answers

## Feature: Daily Quiz Acceptance Tests (Real DB) > Timer Integrity & Answer Handling

### Scenario: Prevents users from submitting multiple answers for the same question

> 🔗 **API Route**: `/api/daily-quiz/answer`

- **Given**: repeated submission
- **Then**: prevent duplicate answers

## Feature: Daily Quiz Acceptance Tests (Real DB) > Results Calculation

### Scenario: should compute correct rankings and xp given finished session

- **Given**: finished session
- **Then**: compute correct rankings and xp

## Feature: Daily Quiz Acceptance Tests (Real DB) > Polling & State Synchronization

### Scenario: should isolate updates given different sessions

- **Given**: different sessions
- **Then**: isolate updates

## Feature: Daily Quiz Acceptance Tests (Real DB) > Polling & State Synchronization

### Scenario: should reflect session availability given server load

- **Given**: server load
- **Then**: reflect session availability
