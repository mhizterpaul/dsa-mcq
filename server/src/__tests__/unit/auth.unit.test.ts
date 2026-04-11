import { authorizeRequest, validateSession } from '../../utils/auth';
import { prisma } from '../../infra/prisma/client';
import jwt from 'jsonwebtoken';
import { CacheService } from '../../infra/cacheService';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

describe('Authorization Logic Unit Tests', () => {
    const testUser = { id: 'user-1', email: 'test@x.com', role: 'USER' };
    const testSession = {
        id: 'sess-1',
        userId: 'user-1',
        expires: new Date(Date.now() + 3600000),
        sessionToken: 'token-1'
    };

    beforeEach(async () => {
        await prisma.session.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('validateSession', () => {
        test('should_return_session_and_user_given_valid_id', async () => {
            await prisma.user.create({ data: testUser });
            await prisma.session.create({ data: testSession });

            const session = await validateSession(testSession.id, testUser.id);
            expect(session.id).toBe(testSession.id);
            expect(session.user.id).toBe(testUser.id);
        });

        test('should_throw_given_non_existent_session', async () => {
            await expect(validateSession('non-existent', 'user-1'))
                .rejects.toThrow('Session not found or invalid');
        });

        test('should_throw_given_session_belongs_to_different_user', async () => {
            await prisma.user.create({ data: testUser });
            await prisma.session.create({ data: testSession });
            await expect(validateSession(testSession.id, 'other-user'))
                .rejects.toThrow('Session not found or invalid');
        });

        test('should_throw_given_session_expired', async () => {
            await prisma.user.create({ data: testUser });
            await prisma.session.create({
                data: { ...testSession, expires: new Date(Date.now() - 1000) }
            });
            await expect(validateSession(testSession.id, testUser.id))
                .rejects.toThrow('Session expired');
        });

        test('should_throw_given_user_not_found', async () => {
            const user = await prisma.user.create({ data: testUser });
            await prisma.session.create({ data: testSession });
            await prisma.user.delete({ where: { id: user.id } });

            await expect(validateSession(testSession.id, testUser.id))
                .rejects.toThrow('Session not found or invalid');
        });
    });

    describe('authorizeRequest', () => {
        const createReq = (token?: string) => ({
            headers: {
                authorization: token ? `Bearer ${token}` : undefined
            }
        } as any);

        test('should_succeed_given_valid_token_and_session', async () => {
            await prisma.user.create({ data: testUser });
            await prisma.session.create({ data: testSession });

            const token = jwt.sign({ sub: testUser.id, sessionId: testSession.id }, JWT_SECRET);
            const context = await authorizeRequest(createReq(token));

            expect(context.userId).toBe(testUser.id);
            expect(context.sessionId).toBe(testSession.id);
            expect(context.role).toBe(testUser.role);
        });

        test('should_throw_given_missing_auth_header', async () => {
            await expect(authorizeRequest(createReq()))
                .rejects.toThrow('Missing or invalid Authorization header');
        });

        test('should_throw_given_malformed_auth_header', async () => {
            const req = { headers: { authorization: 'token' } } as any;
            await expect(authorizeRequest(req))
                .rejects.toThrow('Missing or invalid Authorization header');
        });

        test('should_throw_given_invalid_jwt_signature', async () => {
            const token = jwt.sign({ sub: '123' }, 'wrong-secret');
            await expect(authorizeRequest(createReq(token)))
                .rejects.toThrow('Invalid token');
        });

        test('should_throw_given_expired_jwt', async () => {
            const token = jwt.sign({ sub: '123' }, JWT_SECRET, { expiresIn: '-1s' });
            await expect(authorizeRequest(createReq(token)))
                .rejects.toThrow('Token expired');
        });

        test('should_throw_given_blacklisted_token', async () => {
            const cache = new CacheService();
            const token = jwt.sign({ sub: '123', sessionId: '456' }, JWT_SECRET);
            await cache.set(token, true);

            await expect(authorizeRequest(createReq(token), cache))
                .rejects.toThrow('Invalid token');
        });

        test('should_throw_given_missing_sub_or_sessionid_in_payload', async () => {
            const token = jwt.sign({ foo: 'bar' }, JWT_SECRET);
            await expect(authorizeRequest(createReq(token)))
                .rejects.toThrow('Invalid token payload');
        });

        test('should_map_to_internal_database_error_given_unexpected_db_errors', async () => {
            const findUniqueSpy = jest.spyOn(prisma.session, 'findUnique').mockRejectedValue(new Error('Prisma Crash'));

            const token = jwt.sign({ sub: testUser.id, sessionId: testSession.id }, JWT_SECRET);
            await expect(authorizeRequest(createReq(token)))
                .rejects.toThrow('Internal Database Error');

            findUniqueSpy.mockRestore();
        });
    });
});
