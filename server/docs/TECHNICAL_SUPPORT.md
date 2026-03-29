# Server Technical Support Documentation

## Overview
The DSA-MCQ Server is a Next.js-based API built with TypeScript, using Prisma as an ORM and MongoDB as the primary database.

## Prerequisites
- Node.js 18+
- Yarn or npm
- MongoDB Instance

## How to Run the Server
1. Install dependencies:
   ```bash
   cd server
   yarn install
   ```
2. Configure environment variables in `.env`:
   ```bash
   DATABASE_URL="mongodb+srv://..."
   JWT_SECRET="your-secret"
   ```
3. Run in development mode:
   ```bash
   yarn dev
   ```

## How to Build
```bash
yarn build
```

## How to Deploy
The server can be deployed to any Node.js hosting platform (e.g., Vercel, AWS, Heroku).
Ensure `yarn prisma:migrate-deploy` or similar is run during the build/deployment pipeline to sync the schema.

## Testing Hierarchy
- **Unit Tests**: Test individual utilities and logic (e.g., `auth.unit.test.ts`).
- **Integration Tests**: Test infrastructure components (e.g., `fileCache.test.ts`).
- **Acceptance Tests**: End-to-end API tests using a real database and mocked HTTP requests (e.g., `dailyQuiz.acceptance.test.ts`).

## How to Run Tests
- All tests: `yarn test`
- Acceptance tests: `npx dotenv-cli -e .env.test -- npx jest src/__tests__/acceptance/ --runInBand`

## Key Architecture
- **Polling Sync**: Implemented in `/api/daily-quiz/state` with support for long-polling (5s) and versioned state consistency.
- **Local File Cache**: Deterministic caching layer in `server/src/infra/fileCacheProvider.ts` with TTL and size bounds.
- **Documentation**: Generated from tests using `yarn generate-docs`.
