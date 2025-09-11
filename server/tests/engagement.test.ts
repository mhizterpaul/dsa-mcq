import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismockClient } from 'prismock';
import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';

import { actionHandler } from '../src/pages/api/engagement/action';
import { leaderboardHandler } from '../src/pages/api/engagement/leaderboard';
import { settingsHandler } from '../src/pages/api/engagement/settings';
import { weeklyKingHandler } from '../src/pages/api/engagement/weekly-king';

import { EngagementService } from '../src/services/engagementService';
import { CacheService } from '../src/services/cacheService';
import * as engagementServiceInstance from '../src/services/engagementServiceInstance';

// Mock the singleton module
jest.mock('../src/services/engagementServiceInstance');

describe('/api/engagement', () => {
    let prismock: PrismockClient;
    let engagementService: EngagementService;
    let cacheService: CacheService;
    let testUser: User;
    let testUserToken: string;

    beforeAll(async () => {
        prismock = new PrismockClient() as unknown as PrismockClient;
        cacheService = new CacheService();

        testUser = await prismock.user.create({
            data: {
                id: 'test-user-id',
                name: 'Test User',
                email: 'test@example.com',
            },
        });
        testUserToken = jwt.sign({ user: testUser }, 'your-jwt-secret');
    });

    beforeEach(async () => {
        await prismock.engagement.deleteMany({});
        engagementService = new EngagementService(prismock, cacheService);
        Object.defineProperty(engagementServiceInstance, 'engagementService', {
            get: () => engagementService,
        });
    });

    const makeReqRes = (method: 'POST' | 'GET', options: { headers?: any, body?: any } = {}) => {
        const { req, res } = createMocks({
            method,
            headers: { Authorization: `Bearer ${testUserToken}`, ...options.headers },
            body: options.body,
        });
        return { req: req as NextApiRequest, res: res as NextApiResponse };
    };

    describe('/action', () => {
        it('should update user XP', async () => {
            const { req, res } = makeReqRes('POST', { body: { xp: 50 } });
            await require('../src/pages/api/engagement/action').default(req, res);

            expect(res._getStatusCode()).toBe(200);
            const engagement = await prismock.engagement.findUnique({ where: { userId: testUser.id } });
            expect(engagement?.xp).toBe(50);
        });
    });

    describe('/leaderboard', () => {
        it('should return a ranked list of users', async () => {
            await engagementService.updateUserXP(testUser.id, 100);
            const user2 = await prismock.user.create({ data: { id: 'user2', email: 'user2@test.com' } });
            await engagementService.updateUserXP(user2.id, 50);

            const { req, res } = makeReqRes('GET');
            await require('../src/pages/api/engagement/leaderboard').default(req, res);

            expect(res._getStatusCode()).toBe(200);
            const body = JSON.parse(res._getData());
            expect(body).toHaveLength(2);
            expect(body[0].userId).toBe(testUser.id);
        });
    });

    describe('/weekly-king', () => {
        it('should return the user with the highest weekly XP', async () => {
            await engagementService.updateUserXP(testUser.id, 100);

            const { req, res } = makeReqRes('GET');
            await require('../src/pages/api/engagement/weekly-king').default(req, res);

            expect(res._getStatusCode()).toBe(200);
            const body = JSON.parse(res._getData());
            expect(body.userId).toBe(testUser.id);
        });
    });

    describe('/settings', () => {
        it('should update global settings', async () => {
            const { req, res } = makeReqRes('POST', { body: { quizTitle: 'New Title' } });
            await require('../src/pages/api/engagement/settings').default(req, res);

            expect(res._getStatusCode()).toBe(200);
            const settings = engagementService.getGlobalSettings();
            expect(settings.quizTitle).toBe('New Title');
        });
    });

    describe('Authentication', () => {
        const endpoints = [
            { name: '/action', handler: require('../src/pages/api/engagement/action').default, method: 'POST' },
            { name: '/settings', handler: require('../src/pages/api/engagement/settings').default, method: 'POST' },
        ];

        for (const endpoint of endpoints) {
            it(`should return 401 for unauthenticated access to ${endpoint.name}`, async () => {
                const { req, res } = createMocks({ method: endpoint.method as any });
                await endpoint.handler(req, res);
                expect(res._getStatusCode()).toBe(401);
            });
        }
    });
});
