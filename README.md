# 🧠 DSA-MCQ: Think First. Code Later.

DSA-MCQ is a mobile application designed to help developers master Data Structures and Algorithms by focusing on high-level reasoning and problem-solving intuition through multiple-choice quizzes.

## 🚀 Functional Requirements

### 1. Adaptive Learning Path
- Uses the **SM-2 Spaced Repetition Algorithm** to schedule questions based on user performance.
- Recommends questions using a **Top-K Recommendation engine** that balances mastery, due dates, and exploration.

### 2. Competitive Multiplayer (Daily Quiz)
- Real-time synchronization for multiplayer daily quiz sessions.
- Stateless polling mechanism with version-based consistency for efficient data syncing.
- Competitive leaderboard with XP rewards and visual status (Crowns for winners).

### 3. Comprehensive Question Management
- Heuristic classification into **ALGORITHMS** or **DATA STRUCTURES**.
- Rich MCQ format including title, body, multiple options, and correct answer explanations.
- Bookmark system for saving and reviewing challenging questions.

### 4. Progress Tracking & Gamification
- Detailed user statistics: Level, XP, total attempts, and correct answers.
- Achievement system with unlockable badges.
- Daily XP goals and streak tracking to maintain engagement.

---

## 📂 Project Structure

This is a monorepo consisting of:

- [**Client (Mobile App)**](./client/README.md): React Native application using Redux Toolkit and MSW for testing.
- [**Server (API)**](./server/README.md): Next.js backend with Prisma (MongoDB/SQLite), JWT auth, and file-based caching.

---

## 🛠️ Getting Started

To get the full system running locally:

1. **Setup Server**: Follow [Server README](./server/README.md) to initialize the database and start the API.
2. **Setup Client**: Follow [Client README](./client/README.md) to start the Metro bundler and run the mobile app.

---

## 🔌 API Specification
The full API reference is available in the [OpenAPI Specification](./server/docs/openapi.yaml).
