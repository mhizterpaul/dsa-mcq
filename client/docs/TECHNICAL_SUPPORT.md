# Client Technical Support Documentation

## Overview
The DSA-MCQ Client is a React Native application built with TypeScript, Redux, and Redux Toolkit. It communicates with the server via REST APIs.

## Prerequisites
- Node.js 18+
- Yarn or npm
- React Native environment (Android Studio / Xcode)

## How to Run the Client
1. Install dependencies:
   ```bash
   cd client
   yarn install
   ```
2. Start Metro Bundler:
   ```bash
   yarn start
   ```
3. Run on Android:
   ```bash
   yarn android
   ```
4. Run on iOS:
   ```bash
   yarn ios
   ```

## How to Build
- Android: `cd android && ./gradlew assembleRelease`
- iOS: Build through Xcode.

## Testing Hierarchy
- **Unit Tests**: Test individual components and redux logic.
- **Acceptance Tests**: High-level integration tests using MSW (Mock Service Worker) to mock the API (e.g., `DailyQuizScreen.test.tsx`).

## How to Run Tests
```bash
cd client
yarn test
```

## Key Architecture
- **State Synchronization**: Uses polling-based sync with exponential backoff and versioning to maintain session consistency with the server.
- **Service Layer**: Centralized API calls in `client/src/components/learning/services/`.
- **Styling**: React Native StyleSheet and Material Community Icons.
