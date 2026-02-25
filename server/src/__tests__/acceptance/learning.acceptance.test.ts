process.env.DATABASE_URL = "file:./test.db";
import { createMocks } from 'node-mocks-http';
import featuredCategoriesHandler from '../../pages/api/learning/featured-categories';
import questionsHandler from '../../pages/api/learning/questions';
import { prisma } from '../../infra/prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

const createToken = (user: any, sessionId: string, options = {}) =>
    jwt.sign({ user, sessionId }, JWT_SECRET, options);

const testUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' };
const testSession = { id: 'session-1', userId: 'user-1', expires: new Date(Date.now() + 3600000), sessionToken: 'token-1' };

describe('Learning Route Acceptance Tests', () => {
  beforeEach(async () => {
    // Cleanup database
    await prisma.session.deleteMany();
    await prisma.tagOnQuestion.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.userQuestionData.deleteMany();
    await prisma.question.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Create a test user and session
    await prisma.user.create({ data: testUser });
    await prisma.session.create({ data: testSession });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authentication', () => {
    test('featured-categories rejects unauthenticated requests', async () => {
      const { req, res } = createMocks({ method: 'GET' });
      await featuredCategoriesHandler(req, res);
      expect(res._getStatusCode()).toBe(401);
    });

    test('questions rejects unauthenticated requests', async () => {
      const { req, res } = createMocks({ method: 'GET' });
      await questionsHandler(req, res);
      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('GET /api/learning/featured-categories', () => {
    test('returns only featured categories with question counts', async () => {
      const cat1 = await prisma.category.create({
        data: { id: 'cat1', name: 'Algorithms', featured: true },
      });
      const cat2 = await prisma.category.create({
        data: { id: 'cat2', name: 'Database', featured: false },
      });

      await prisma.question.create({
        data: {
          id: 1,
          title: 'Q1',
          body: 'B1',
          difficulty: 'EASY',
          categoryId: 'cat1',
          a: 'A', b: 'B', c: 'C', d: 'D', correct: 'A',
          tagsText: '',
          companyTags: '',
          hints: '',
          similarQuestionIds: '',
          similarQuestionsText: ''
        },
      });

      const token = createToken(testUser, testSession.id);
      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: `Bearer ${token}` },
      });

      await featuredCategoriesHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());

      expect(data).toHaveLength(1);
      expect(data[0].id).toBe('cat1');
      expect(data[0].name).toBe('Algorithms');
      expect(data[0]._count.questions).toBe(1);
    });
  });

  describe('POST /api/learning/questions', () => {
    test('returns formatted questions for given IDs', async () => {
      const cat = await prisma.category.create({
        data: { id: 'cat1', name: 'Algorithms' },
      });

      const tag = await prisma.tag.create({ data: { name: 'Array' } });

      const q1 = await prisma.question.create({
        data: {
          id: 101,
          title: 'Two Sum',
          body: 'Given an array...',
          difficulty: 'EASY',
          categoryId: 'cat1',
          a: 'Option A',
          b: 'Option B',
          c: 'Option C',
          d: 'Option D',
          correct: 'A',
          tagsText: 'Array',
          companyTags: '',
          hints: '',
          similarQuestionIds: '',
          similarQuestionsText: '',
          tags: {
            create: {
              tagId: tag.id
            }
          }
        },
      });

      const token = createToken(testUser, testSession.id);
      const { req, res } = createMocks({
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: { ids: [101] },
      });

      await questionsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());

      expect(data).toHaveLength(1);
      expect(data[0]).toEqual({
        id: 101,
        question: 'Two Sum: Given an array...',
        category: 'Algorithms',
        tags: ['Array'],
        options: [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: false },
          { text: 'Option C', isCorrect: false },
          { text: 'Option D', isCorrect: false },
        ],
      });
    });

    test('returns 400 if ids is not an array', async () => {
      const token = createToken(testUser, testSession.id);
      const { req, res } = createMocks({
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: { ids: 'not-an-array' },
      });

      await questionsHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('GET /api/learning/questions', () => {
    test('returns formatted questions by category and difficulty', async () => {
        const cat = await prisma.category.create({
            data: { id: 'cat2', name: 'Data Structures' },
        });

        await prisma.question.create({
            data: {
                id: 201,
                title: 'Linked List',
                body: 'Reverse it',
                difficulty: 'MEDIUM',
                categoryId: 'cat2',
                a: 'A', b: 'B', c: 'C', d: 'D', correct: 'B',
                tagsText: '',
                companyTags: '',
                hints: '',
                similarQuestionIds: '',
                similarQuestionsText: ''
            },
        });

        const token = createToken(testUser, testSession.id);
        const { req, res } = createMocks({
            method: 'GET',
            headers: { authorization: `Bearer ${token}` },
            query: { categoryId: 'cat2', difficulty: 'medium' },
        });

        await questionsHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());

        expect(data).toHaveLength(1);
        expect(data[0].id).toBe(201);
        expect(data[0].options[1].isCorrect).toBe(true);
    });
  });
});
