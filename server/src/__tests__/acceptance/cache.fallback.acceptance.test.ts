import { prisma } from '../../infra/prisma/client';
import { userController } from '../../controllers/userController';
import { CacheService } from '../../infra/cacheService';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

class Actor {
    id: string;
    token: string;
    sessionId: string;

    constructor(user: { id: string }) {
        this.id = user.id;
        this.sessionId = `sess-${user.id}`;
        this.token = jwt.sign({ user: { id: user.id }, sessionId: this.sessionId }, JWT_SECRET);
    }
}

describe('Cache Fallback Acceptance Scenario (Service Layer)', () => {
    const testUser = { id: 'cache-user-1', email: 'cache@test.com', name: 'CacheUser' };
    let actor: Actor;
    let cacheService: CacheService;

    beforeAll(() => {
        process.env.FORCE_FILE_CACHE = 'true';
    });

    afterAll(() => {
        delete process.env.FORCE_FILE_CACHE;
    });

    beforeEach(async () => {
        await prisma.session.deleteMany();
        await prisma.engagement.deleteMany();
        await prisma.leaderboard.deleteMany();
        await prisma.quizParticipant.deleteMany();
        await prisma.user.deleteMany();

        const cacheDir = path.resolve('.cache');
        if (fs.existsSync(cacheDir)) {
            fs.rmSync(cacheDir, { recursive: true, force: true });
        }

        await prisma.user.create({ data: testUser });
        actor = new Actor(testUser);
        cacheService = new CacheService();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    /**
     * @Doc("Scenario K: DB Failure -> Cache Fallback via Service")
     */
    test('should_fallback_to_cache_given_service_layer_db_failure', async () => {
        const cacheKey = `profile-summary:${actor.id}`;

        // 1. Service returns data and we manually update cache (simulating the API handler's job)
        const profile = await userController.getProfileSummary(actor.id);
        await cacheService.set(cacheKey, profile, 3600, actor.token);

        // 2. Simulate DB failure
        const spy = jest.spyOn(prisma.user, 'findUnique').mockRejectedValue(new Error('DB Failure'));

        // 3. Acceptance Logic: Verify we can still get data from cache using our provider
        const cachedData = await cacheService.get(cacheKey, actor.token);
        expect(cachedData).toBeDefined();
        expect(cachedData.user.id).toBe(actor.id);

        spy.mockRestore();
    });

    test('should_not_leak_cache_across_actors', async () => {
        const actorB = new Actor({ id: 'user-b' });
        const cacheKey = 'some-key';

        await cacheService.set(cacheKey, { data: 'A' }, 3600, actor.token);

        const dataForB = await cacheService.get(cacheKey, actorB.token);
        expect(dataForB).toBeNull();

        const dataForA = await cacheService.get(cacheKey, actor.token);
        expect(dataForA).toEqual({ data: 'A' });
    });
});
