# Documentation: sync.acceptance.test.ts

## Feature: Sync Acceptance Tests (QA Rigorous) > Method Enforcement

### Scenario: Rejects GET method

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Method Enforcement

### Scenario: Rejects PUT method

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Method Enforcement

### Scenario: Rejects DELETE method

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Authentication & Security

### Scenario: Endpoints must reject unauthorized access

> 🔗 **API Route**: `/api/sync`

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Authentication & Security

### Scenario: 401 if invalid token

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Authentication & Security

### Scenario: 403 if missing signature

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Authentication & Security

### Scenario: Rejects tampered payloads using HMAC signature verification

> 🔗 **API Route**: `/api/sync`

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Payload Validation

### Scenario: 400 if payload is not an object

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Payload Validation

### Scenario: 400 if table is not an array

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Payload Validation

### Scenario: 400 if invalid date format

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Isolation & Data Integrity

### Scenario: Strict userId isolation: Cannot sync data for another user

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Isolation & Data Integrity

### Scenario: Regular users cannot modify global categories

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Conflict Resolution (Deterministic)

### Scenario: Implements Last-Write-Wins (LWW) conflict resolution

> 🔗 **API Route**: `/api/sync`

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Conflict Resolution (Deterministic)

### Scenario: Client wins when client is newer

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Batch Sync & Concurrency

### Scenario: Batch sync multiple records and tables

- Status: ✅ passed

## Feature: Sync Acceptance Tests (QA Rigorous) > Batch Sync & Concurrency

### Scenario: Enforces write lock with 409 Conflict

- Status: ✅ passed
