import { createMocks } from 'node-mocks-http';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { questionsHandler } from '../src/pages/api/learning/questions';
import { prismock as prisma } from './helpers/prismock';

const questions = [
    {
        question: "Two Sum...",
        category: "algorithms",
        tags: ['hash map', 'two sum', 'time complexity'],
        options: [
            { text: "Use a hash map...", isCorrect: true },
        ]
    },
    {
        question: "Add Two Numbers...",
        category: "algorithms",
        tags: ['linked list', 'arithmetic', 'pointers'],
        options: [
            { text: "Traverse both lists node-by-node...", isCorrect: true },
        ]
    },
];

// Helper function to create an authenticated user
async function createAuthenticatedUser(email = 'testuser@example.com', password = 'TestPassword123!') {
  const user = await prisma.user.create({ data: { email, password } });
  const accessToken = jwt.sign({ user }, 'your-jwt-secret');
  return { user, accessToken };
}

describe('/api/learning/questions', () => {
    beforeEach(async () => {
        await prisma.question.deleteMany({});
        await prisma.category.deleteMany({});
        await prisma.user.deleteMany({});
    });

    it('should return the requested questions', async () => {
        // Setup: Create categories and questions in the mock DB
        const category = await prisma.category.create({ data: { name: 'algorithms' } });
        const createdQuestions = await Promise.all(
            questions.map(q => prisma.question.create({ data: { ...q, categoryId: category.id, difficulty: 'EASY', title: q.question, body: '' } }))
        );

        // Since prismock doesn't support the 'in' filter, we mock the findMany call directly
        // to simulate the expected behavior.
        const findManySpy = jest.spyOn(prisma.question, 'findMany').mockResolvedValue(createdQuestions);

        const { accessToken } = await createAuthenticatedUser();
        const { req, res } = createMocks({
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: { ids: createdQuestions.map(q => q.id) }, // The handler will use these IDs
        });

        await questionsHandler(req, res, prisma);

        expect(findManySpy).toHaveBeenCalledWith({
            where: { id: { in: createdQuestions.map(q => String(q.id)) } },
        });
        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        // The data from the API will have ISO string dates, while prismock keeps them as Date objects.
        const expectedData = createdQuestions.map(q => ({
            ...q,
            createdAt: q.createdAt.toISOString(),
            updatedAt: q.updatedAt ? q.updatedAt.toISOString() : null,
        }));
        expect(data).toEqual(expectedData);

        findManySpy.mockRestore();
    });
});
