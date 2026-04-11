# 📜 Acceptance Testing Scenarios (Single Source of Truth)

This document is auto-generated from `@Doc` and `@Route` annotations in acceptance tests.

## Scenario: Scenario C: Password Reset Flow
- **Routes:** `/api/auth/request-password-reset`, `/api/auth/reset-password`
- **Source:** `auth.password.acceptance.test.ts`

## Scenario: Scenario K: DB Failure -> Cache Fallback
- **Routes:** `/api/user/profile-summary`
- **Source:** `cache.fallback.acceptance.test.ts`

## Scenario: Endpoints must reject unauthorized access
- **Routes:** `/api/daily-quiz/*`
- **Source:** `dailyQuiz.acceptance.test.ts`

## Scenario: Rejects requests with expired session tokens
- **Routes:** `/api/daily-quiz/sessions`
- **Source:** `dailyQuiz.acceptance.test.ts`

## Scenario: Match users with compatible leaderboard stats
- **Source:** `dailyQuiz.acceptance.test.ts`

## Scenario: Ensures session capacity is never exceeded even under high concurrency
- **Routes:** `/api/daily-quiz/sessions`
- **Source:** `dailyQuiz.acceptance.test.ts`

## Scenario: Enforces a strict 5-minute time limit for quiz submissions
- **Routes:** `/api/daily-quiz/answer`
- **Source:** `dailyQuiz.acceptance.test.ts`

## Scenario: Prevents users from submitting multiple answers for the same question
- **Routes:** `/api/daily-quiz/answer`
- **Source:** `dailyQuiz.acceptance.test.ts`

## Scenario: Scenario J: Long Poll Timeout returns 304 if no changes
- **Routes:** `/api/daily-quiz/state`
- **Source:** `dailyQuiz.sync.acceptance.test.ts`

## Scenario: Scenario I: Polling Synchronization Consistency
- **Routes:** `/api/daily-quiz/state`
- **Source:** `dailyQuiz.sync.acceptance.test.ts`

## Scenario: Scenario M: Quiz Session Expiry
- **Source:** `scheduler.cleanup.acceptance.test.ts`

## Scenario: Endpoints must reject unauthorized access
- **Routes:** `/api/sync`
- **Source:** `sync.acceptance.test.ts`

## Scenario: Rejects tampered payloads using HMAC signature verification
- **Routes:** `/api/sync`
- **Source:** `sync.acceptance.test.ts`

## Scenario: Implements Last-Write-Wins (LWW) conflict resolution
- **Routes:** `/api/sync`
- **Source:** `sync.acceptance.test.ts`

## Scenario: Retrieves essential user profile data for the dashboard
- **Routes:** `/api/user/profile-summary`
- **Source:** `user.acceptance.test.ts`

## Scenario: Allows users to update their profile information and preferences
- **Routes:** `/api/user/profile`
- **Source:** `user.acceptance.test.ts`

## Scenario: Uploads and updates the user's avatar image
- **Routes:** `/api/user/profile-picture`
- **Source:** `user.acceptance.test.ts`
