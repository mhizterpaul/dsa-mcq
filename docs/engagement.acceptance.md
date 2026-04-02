# Documentation: engagement.acceptance.test.ts

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 1. XP & Action Handling

### Scenario: accumulates XP across multiple calls and creates record automatically

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 1. XP & Action Handling

### Scenario: rejects negative XP (400)

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 1. XP & Action Handling

### Scenario: handles zero XP submission (200)

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 1. XP & Action Handling

### Scenario: rejects missing xp field in body (400)

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 1. XP & Action Handling

### Scenario: large XP values stress test (prevents 32-bit overflow)

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 2. Leaderboard: Deterministic sorting & Contract Locking

### Scenario: returns deterministic ranking (XP desc, userId asc) with explicit rank

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 2. Leaderboard: Deterministic sorting & Contract Locking

### Scenario: freezes contract: response must contain full metadata for UI rendering

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 3. Weekly King: Aggregation & Temporal Hardening

### Scenario: aggregates multi-session scores and strictly excludes past-week data

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 4. Achievements: Zero-State & Complete Contract

### Scenario: zero-state resilience: returns full contract even for new users

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 5. Notifications: Order & POST Validation

### Scenario: POST validates missing fields and returns 400

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 5. Notifications: Order & POST Validation

### Scenario: returns notifications newest-first

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 6. Security: ADMIN Policy & Isolation

### Scenario: ADMIN bypasses isolation while USER is strictly restricted (403)

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 7. API Discipline: Method 405 Enforcement

### Scenario: /action returns 405 for async (req, res, deps) => {
        try {
            const authContext = await (0, auth 1.authorizeRequest)(req, deps === null || deps === void 0 ? void 0 : deps.cache);
            const authenticatedReq = req;
            authenticatedReq.user = authContext.user;
            authenticatedReq.sessionId = authContext.sessionId;
            authenticatedReq.syncKey = authContext.syncKey;
            return handler(authenticatedReq, res);
        }
        catch (error) {
            if (error.message === 'Database Connection Error' || error.message === 'Internal Database Error' || (error.code && typeof error.code === 'string' && error.code.startsWith('P'))) {
                console.error('withAuth database error:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            const clientErrors = [
                'Missing or invalid Authorization header',
                'Invalid token',
                'Token expired',
                'Invalid token payload',
                'Session not found or invalid',
                'Session expired',
                'User not found'
            ];
            if (clientErrors.includes(error.message)) {
                return res.status(401).json({ message: error.message });
            }
            // Fallback for any other unexpected errors
            console.error('withAuth unexpected error:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 7. API Discipline: Method 405 Enforcement

### Scenario: /leaderboard returns 405 for async function handler(req, res) {
    const service = new engagementController 1.EngagementService(client 1.prisma);
    return leaderboardHandler(req, res, service);
}

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 7. API Discipline: Method 405 Enforcement

### Scenario: /weekly-king returns 405 for async function handler(req, res) {
    const service = new engagementController 1.EngagementService(client 1.prisma);
    return weeklyKingHandler(req, res, service);
}

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 7. API Discipline: Method 405 Enforcement

### Scenario: /achievements returns 405 for async (req, res, deps) => {
        try {
            const authContext = await (0, auth 1.authorizeRequest)(req, deps === null || deps === void 0 ? void 0 : deps.cache);
            const authenticatedReq = req;
            authenticatedReq.user = authContext.user;
            authenticatedReq.sessionId = authContext.sessionId;
            authenticatedReq.syncKey = authContext.syncKey;
            return handler(authenticatedReq, res);
        }
        catch (error) {
            if (error.message === 'Database Connection Error' || error.message === 'Internal Database Error' || (error.code && typeof error.code === 'string' && error.code.startsWith('P'))) {
                console.error('withAuth database error:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            const clientErrors = [
                'Missing or invalid Authorization header',
                'Invalid token',
                'Token expired',
                'Invalid token payload',
                'Session not found or invalid',
                'Session expired',
                'User not found'
            ];
            if (clientErrors.includes(error.message)) {
                return res.status(401).json({ message: error.message });
            }
            // Fallback for any other unexpected errors
            console.error('withAuth unexpected error:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

- Status: ✅ passed

## Feature: Engagement Route Hardened Acceptance Tests (Enterprise Grade) > 8. Data Integrity: Cascade Deletion

### Scenario: deleting a user purges all engagement and notification artifacts

- Status: ✅ passed
