import { createMocks } from 'node-mocks-http';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { featuredCategoriesHandler } from '../src/pages/api/learning/featured-categories';
import { AnalyticsService } from '../src/services/analyticsService';
import { prismock as prisma } from './helpers/prismock';

// Helper function to create an authenticated user
async function createAuthenticatedUser(email = 'testuser@example.com', password = 'TestPassword123!') {
  const user = await prisma.user.create({ data: { email, password } });
  const accessToken = jwt.sign({ user }, 'your-jwt-secret');
  return { user, accessToken };
}

describe('/api/learning', () => {
    let analyticsService: AnalyticsService;

    beforeAll(() => {
        analyticsService = new AnalyticsService(prisma);
    });

    beforeEach(async () => {
        await prisma.question.deleteMany({});
        await prisma.category.deleteMany({});
        await prisma.user.deleteMany({});
    });


    describe('/featured-categories', () => {
        it('should return the top 5 liked categories', async () => {
            // Setup: Create categories and questions with likes
            const category1 = await prisma.category.create({ data: { name: 'Category 1' } });
            const category2 = await prisma.category.create({ data: { name: 'Category 2' } });
            await prisma.question.create({ data: { title: 'Q1', body: 'b', difficulty: 'EASY', categoryId: category1.id, likes: 100 } });
            await prisma.question.create({ data: { title: 'Q2', body: 'b', difficulty: 'EASY', categoryId: category2.id, likes: 50 } });

            const { accessToken } = await createAuthenticatedUser();
            const { req, res } = createMocks({
                method: 'GET',
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            await featuredCategoriesHandler(req, res, analyticsService);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());
            expect(data).toHaveLength(2);
            expect(data[0].name).toBe('Category 1');
        });

        it('should return 401 for unauthenticated users', async () => {
            const { req, res } = createMocks({ method: 'GET' });
            await featuredCategoriesHandler(req, res, analyticsService);
            expect(res._getStatusCode()).toBe(401);
        });
    });
});
