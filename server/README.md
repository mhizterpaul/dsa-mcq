# ⚙️ DSA-MCQ: Server

The backend for the DSA-MCQ platform, built with **Next.js (Pages Router)** and **Prisma**.

## 🛠️ Technical Stack
- **Framework**: Next.js (Pages Router)
- **Database**: MongoDB (Production), SQLite (Testing)
- **ORM**: Prisma
- **Authentication**: JWT, Twitter OAuth
- **Cache**: Local asynchronous file-based cache with TTL
- **Documentation**: OpenAPI 3.0

## 🧪 Testing

### Test Pipeline
The server uses a specialized SQLite-based test pipeline to ensure high performance and zero dependency on a live MongoDB instance during CI/CD.

#### 1. Acceptance Tests
Verify end-to-end API behavior using a local `test.db`.
- **Command**: `yarn test`
- **Logic**: `scripts/setupTestDb.ts` transforms the production MongoDB schema into a SQLite-compatible version on-the-fly.

#### 2. Integration Tests
Verify external infrastructure interactions (Redis, Supabase).
- **Command**: `RUN_INTEGRATION_TESTS=true yarn test`

## 🏗️ Building & Artifacts

### Database Setup
To generate the Prisma client:
```bash
yarn prisma:generate
```

To update the database schema (Production):
```bash
yarn prisma:migrate-deploy
```

### Production Build
```bash
yarn build
yarn start
```

## 🔌 API Routes Mapping

| Module | Base Path | Description |
| :--- | :--- | :--- |
| **Auth** | `/api/auth` | Login, Registration, Password Reset, OAuth |
| **Daily Quiz** | `/api/daily-quiz` | Session management, State polling, Answer submission |
| **Learning** | `/api/learning` | Question retrieval, Featured categories |
| **User** | `/api/user` | Profile management, Stats, Settings |
| **Engagement** | `/api/engagement` | Achievements, Badges, Leaderboards |
| **Sync** | `/api/sync` | User progress synchronization |

👉 Full API documentation: [openapi.yaml](./docs/openapi.yaml)

## 🛠️ Developer Guide (Server)

### 1. Prerequisites
- Node.js 18+
- Yarn or npm
- MongoDB Instance (Production)

### 2. Environment Setup
Create a `.env` file in the `server` directory:
```bash
DATABASE_URL="mongodb+srv://..."
JWT_SECRET="your-secret"
```

### 3. How to Run & Build
```bash
yarn install
yarn dev     # Development mode
yarn build   # Build for production
yarn start   # Start production server
```

### 4. Testing Hierarchy
The server employs a tiered testing strategy:
- **Unit Tests**: Logic-specific tests (e.g., `auth.unit.test.ts`).
- **Integration Tests**: Infrastructure verification (e.g., `fileCache.test.ts`, `database.test.ts`). These often require `RUN_INTEGRATION_TESTS=true`.
- **Acceptance Tests**: End-to-end API verification. These use a dynamic SQLite-based test pipeline to avoid MongoDB overhead in CI.
  - **Run**: `yarn test`
