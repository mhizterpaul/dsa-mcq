# 🛠️ Developer Guide: DSA-MCQ

This guide provides instructions for developers on how to build, test, and integrate with the DSA-MCQ platform.

---

## 🧪 Testing Frameworks

### Server-Side Tests
The server uses **Jest** with a specialized SQLite-based test pipeline.

#### 1. Acceptance Tests
These verify end-to-end API behavior using a local SQLite database (`test.db`) to simulate the production environment without the overhead of MongoDB.
- **Run**: `cd server && yarn test`
- **Mechanism**: The pipeline uses `scripts/setupTestDb.ts` to transform the MongoDB schema into a SQLite-compatible version (`schema.test.prisma`) on-the-fly.

#### 2. Integration Tests
These verify interactions between the server and external infrastructure (Redis, Supabase, Storage).
- **Run**: `cd server && RUN_INTEGRATION_TESTS=true yarn test`
- **Note**: Integration tests are disabled by default to prevent side effects in CI. They require valid credentials in `.env.test`.

### Client-Side Tests
The mobile app uses **Jest** and **React Native Testing Library** (RNTL) for component and acceptance testing.

- **Run Tests**:
  ```bash
  cd client && yarn test
  ```
- **Infrastructure**: Tests use **Mock Service Worker (MSW)** to intercept network requests, providing deterministic API responses without a running server.

---

## 🏗️ Generating Artifacts

### Server Artifacts
- **Prisma Client**: To generate the database client after schema changes:
  ```bash
  cd server && yarn prisma:generate
  ```
- **Production Build**: To create a production-ready Next.js build:
  ```bash
  cd server && yarn build
  ```

### Client Artifacts
- **Metro Bundler**: Start the JS bundler:
  ```bash
  cd client && yarn start
  ```
- **Native Builds**:
  - **Android**: `cd client && yarn android` (Requires Android SDK)
  - **iOS**: `cd client && yarn ios` (Requires macOS, Xcode, and CocoaPods: `cd client/ios && pod install`)

---

## 🔌 API Specification & Integration

### OpenAPI Specification
The source of truth for the API is located at:
👉 [**server/docs/openapi.yaml**](../server/docs/openapi.yaml)

### Client Route Tree & API Mapping
The following table maps client-side screens to their corresponding API endpoints and primary purposes.

| Screen | Client File | API Endpoint(s) | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Auth** | `AuthScreen.tsx` | `/api/auth/*`, `/api/user/profile-summary` | Login, Registration, Twitter Auth |
| **Home** | `screens/index.tsx` | `/api/user/profile-summary`, `/api/learning/featured-categories` | Dashboard, Quick Start Quiz |
| **Daily Quiz** | `DailyQuizScreen.tsx` | `/api/daily-quiz/sessions`, `/api/daily-quiz/state`, `/api/daily-quiz/answer` | Competitive daily multiplayer quiz |
| **Practice Quiz**| `QuizScreen.tsx` | `/api/learning/questions` | Spaced repetition practice |
| **Bookmarks** | `BookmarkScreen.tsx`| `/api/learning/questions` | Review saved questions |
| **Achievements**| `AchievementScreen.tsx`| `/api/user/profile-summary` | User badges and statistics |
| **Goal Setting** | `GoalScreen.tsx` | `/api/sync` | Setting daily XP goals |

### State Synchronization (Polling)
The application uses a **stateless polling model** for real-time features like the Daily Quiz.
- **Client implementation**: `DailyQuizScreen.tsx` uses `setInterval` with exponential backoff on failure.
- **Server implementation**: `/api/daily-quiz/state` returns the current participants and status. It supports version-based updates to minimize payload size.

---

## 📚 Automated Documentation (ATDD)
We use an ATDD-first approach where tests serve as documentation.
- **Scenario Extraction**: `server/scripts/generateDocs.ts` parses Jest results and source code to create human-readable Markdown scenarios.
- **Annotations**: Use `@Doc("Description")` for scenario titles and `@Route("/path")` for API mappings in your test files.
- **Command**:
  ```bash
  cd server && yarn generate-docs
  ```
