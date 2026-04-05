import { createMocks, RequestMethod } from 'node-mocks-http';
import meHandler from '../../pages/api/user/me';
import { prisma } from '../../infra/prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

describe('Hardened Security Acceptance Tests', () => {
    const testUser = { id: 'user-1', email: 'test@x.com', role: 'USER' };
    const otherUser = { id: 'user-2', email: 'other@x.com', role: 'USER' };

    beforeEach(async () => {
        await prisma.session.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('should reject valid JWT but expired session in DB', async () => {
        await prisma.user.create({ data: testUser });
        const session = await prisma.session.create({
            data: {
                id: 'expired-sess',
                userId: testUser.id,
                sessionToken: 'tk1',
                expires: new Date(Date.now() - 1000)
            }
        });

        const token = jwt.sign({ user: { id: testUser.id }, sessionId: session.id }, JWT_SECRET);
        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${token}` }
        });

        await meHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
        expect(JSON.parse(res._getData()).message).toBe('Session expired');
    });

    test('should reject session bound to a different user', async () => {
        await prisma.user.createMany({ data: [testUser, otherUser] });
        const sessionOfOther = await prisma.session.create({
            data: {
                id: 'other-sess',
                userId: otherUser.id,
                sessionToken: 'tk2',
                expires: new Date(Date.now() + 3600000)
            }
        });

        // JWT claims to be user-1, but provides session-id of user-2
        const token = jwt.sign({ user: { id: testUser.id }, sessionId: sessionOfOther.id }, JWT_SECRET);
        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${token}` }
        });

        await meHandler(req, res);
        expect(res._getStatusCode()).toBe(401);
        expect(JSON.parse(res._getData()).message).toBe('Session not found or invalid');
    });

    test('should reject replayed token after session deletion', async () => {
        await prisma.user.create({ data: testUser });
        const session = await prisma.session.create({
            data: {
                id: 'replay-sess',
                userId: testUser.id,
                sessionToken: 'tk3',
                expires: new Date(Date.now() + 3600000)
            }
        });

        const token = jwt.sign({ user: { id: testUser.id }, sessionId: session.id }, JWT_SECRET);
        const { req: req1, res: res1 } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${token}` }
        });

        await meHandler(req1, res1);
        expect(res1._getStatusCode()).toBe(200);

        // Delete session
        await prisma.session.delete({ where: { id: session.id } });

        const { req: req2, res: res2 } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${token}` }
        });

        await meHandler(req2, res2);
        expect(res2._getStatusCode()).toBe(401);
        expect(JSON.parse(res2._getData()).message).toBe('Session not found or invalid');
    });

    test('should allow multiple concurrent sessions for the same user', async () => {
        await prisma.user.create({ data: testUser });
        const s1 = await prisma.session.create({
            data: { id: 's1', userId: testUser.id, sessionToken: 'tk1', expires: new Date(Date.now() + 3600000) }
        });
        const s2 = await prisma.session.create({
            data: { id: 's2', userId: testUser.id, sessionToken: 'tk2', expires: new Date(Date.now() + 3600000) }
        });

        const t1 = jwt.sign({ user: { id: testUser.id }, sessionId: s1.id }, JWT_SECRET);
        const t2 = jwt.sign({ user: { id: testUser.id }, sessionId: s2.id }, JWT_SECRET);

        const { res: res1 } = createMocks({ method: 'GET', headers: { authorization: `Bearer ${t1}` } });
        await meHandler(createMocks({ method: 'GET', headers: { authorization: `Bearer ${t1}` } }).req, res1);
        expect(res1._getStatusCode()).toBe(200);

        const { res: res2 } = createMocks({ method: 'GET', headers: { authorization: `Bearer ${t2}` } });
        await meHandler(createMocks({ method: 'GET', headers: { authorization: `Bearer ${t2}` } }).req, res2);
        expect(res2._getStatusCode()).toBe(200);
    });
});
