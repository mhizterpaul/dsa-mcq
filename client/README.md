# 📱 DSA-MCQ: Client

The mobile application for the DSA-MCQ platform, built with **React Native** and **Redux Toolkit**.

## 🛠️ Technical Stack
- **Framework**: React Native
- **State Management**: Redux Toolkit (Slices)
- **Navigation**: React Navigation (Stack)
- **Styling**: React Native UI Lib / Paper
- **Networking**: Fetch API with Polling for real-time updates
- **Testing**: Jest + React Native Testing Library (RNTL) + MSW

## 🧪 Testing

### Running Tests
```bash
yarn test
```
All network requests are intercepted by **Mock Service Worker (MSW)** for deterministic testing.

## 🏗️ Building & Artifacts

### Metro Bundler
```bash
yarn start
```

### Native Builds
- **Android**: `yarn android`
- **iOS**: `cd ios && pod install && cd .. && yarn ios` (macOS required)

## 🗺️ Page Router Tree & Component Hierarchy

The application navigation is defined in `src/navigation/navigator.tsx`. Below is the mapping of screens to their logical sub-components.

| Route | Screen Component | Primary Sub-Components | Linked API Route |
| :--- | :--- | :--- | :--- |
| `Welcome` | `Welcome.tsx` | - | - |
| `Auth` | `AuthScreen.tsx` | `Spinner`, `OAuth` | `/api/auth/*` |
| `Home` | `screens/index.tsx` | `UserScore`, `UserProfileSummary`, `WeeklyKing`, `DailyQuizBanner`, `FeaturedCategories`, `RecentQuizzes`, `BottomNav` | `/api/user/profile-summary`, `/api/learning/featured-categories` |
| `DailyQuiz` | `DailyQuizScreen.tsx`| `DailyQuiz` (Interface), `BackButton`, `BottomNav` | `/api/daily-quiz/*` |
| `Quiz` | `QuizScreen.tsx` | `Quiz` (Interface), `ProgressBar`, `QuestionCard` | `/api/learning/questions` |
| `Achievement`| `AchievementScreen.tsx`| `BadgeDetails`, `Achievements` (Interface), `UserSettings` | `/api/engagement/*` |
| `Bookmark` | `BookmarkScreen.tsx` | `BookmarkList` | `/api/learning/questions` |
| `Goal` | `GoalScreen.tsx` | `GoalSetter` | `/api/sync` |
| `SessionSummary`| `SessionSummaryScreen.tsx`| `SessionSummary` | `/api/daily-quiz/results` |

## 🔄 Real-time Synchronization
The client uses a **Stateless Polling** mechanism for the Daily Quiz. This is implemented in `DailyQuizScreen.tsx` using `setInterval` with a versioning check to ensure state consistency across participants.

## 🛠️ Developer Guide (Client)

### 1. Prerequisites
- Node.js 18+
- Yarn or npm
- Android Studio (Android) / Xcode (iOS/macOS)

### 2. Setup & Development
```bash
yarn install
yarn start     # Start Metro Bundler
yarn android   # Run on Android Emulator/Device
yarn ios       # Run on iOS Simulator (macOS only)
```

### 3. Testing Hierarchy
- **Unit Tests**: Verification of individual hooks and Redux reducers.
- **Integration Tests**: Component interaction and data flow.
- **Acceptance Tests**: High-level behavioral verification (e.g., `DailyQuizScreen.test.tsx`).
  - **Note**: All network interactions are mocked via **Mock Service Worker (MSW)**.
  - **Run**: `yarn test`

### 4. Component Lifecycle Stability
To prevent memory leaks and flaky tests:
- Components use `isMounted` guards for asynchronous updates.
- Acceptance tests utilize `user-event` and `waitFor` for deterministic user interactions.
- Randomness in recommendation algorithms is disabled in test environments (`process.env.NODE_ENV === 'test'`).
