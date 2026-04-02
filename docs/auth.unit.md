# Documentation: auth.unit.test.ts

## Feature: Authorization Logic Unit Tests > validateSession

### Scenario: should return session and user given valid id

- **Given**: valid id
- **Then**: return session and user

## Feature: Authorization Logic Unit Tests > validateSession

### Scenario: should throw given non existent session

- **Given**: non existent session
- **Then**: throw

## Feature: Authorization Logic Unit Tests > validateSession

### Scenario: should throw given session belongs to different user

- **Given**: session belongs to different user
- **Then**: throw

## Feature: Authorization Logic Unit Tests > validateSession

### Scenario: should throw given session expired

- **Given**: session expired
- **Then**: throw

## Feature: Authorization Logic Unit Tests > validateSession

### Scenario: should throw given user not found

- **Given**: user not found
- **Then**: throw

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should succeed given valid token and session

- **Given**: valid token and session
- **Then**: succeed

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should throw given missing auth header

- **Given**: missing auth header
- **Then**: throw

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should throw given malformed auth header

- **Given**: malformed auth header
- **Then**: throw

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should throw given invalid jwt signature

- **Given**: invalid jwt signature
- **Then**: throw

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should throw given expired jwt

- **Given**: expired jwt
- **Then**: throw

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should throw given blacklisted token

- **Given**: blacklisted token
- **Then**: throw

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should throw given missing sub or sessionid in payload

- **Given**: missing sub or sessionid in payload
- **Then**: throw

## Feature: Authorization Logic Unit Tests > authorizeRequest

### Scenario: should map to internal database error given unexpected db errors

- **Given**: unexpected db errors
- **Then**: map to internal database error
