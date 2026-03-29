# Documentation: auth.unit.test.ts

## Feature: Authorization Logic Unit Tests > validateSession

### Scenario: should return session and user

- **Given**: valid id
- **Then**: return session and user

## Feature: Authorization Logic Unit Tests > validateSession

### Scenario: should throw

- **Given**: non existent session
- **Then**: throw

## Feature: Authorization Logic Unit Tests > validateSession

### Scenario: should throw

- **Given**: session belongs to different user
- **Then**: throw

## Feature: Authorization Logic Unit Tests > validateSession

### Scenario: should throw

- **Given**: session expired
- **Then**: throw

## Feature: Authorization Logic Unit Tests > validateSession

### Scenario: should throw

- **Given**: user not found
- **Then**: throw

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should succeed

- **Given**: valid token and session
- **Then**: succeed

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should throw

- **Given**: missing auth header
- **Then**: throw

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should throw

- **Given**: malformed auth header
- **Then**: throw

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should throw

- **Given**: invalid jwt signature
- **Then**: throw

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should throw

- **Given**: expired jwt
- **Then**: throw

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should throw

- **Given**: blacklisted token
- **Then**: throw

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should throw

- **Given**: missing sub or sessionid in payload
- **Then**: throw

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should map to internal database error

- **Given**: unexpected db errors
- **Then**: map to internal database error
