import request from 'supertest';
import featuredCategoriesHandler from '../src/pages/api/learning/featured-categories';
import questionsHandler from '../src/pages/api/learning/questions';

describe('/api/learning', () => {
  describe('/featured-categories', () => {
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
      const { status } = await request(featuredCategoriesHandler).post('/');
      expect(status).toBe(405);
    });

    it('should return 200 and an array of categories on success', async () => {
      const { status, body } = await request(featuredCategoriesHandler).get('/');
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('id');
        expect(body[0]).toHaveProperty('name');
        expect(body[0]).toHaveProperty('masteryScore');
      }
    });
  });

  describe('/questions', () => {
    it('should return 405 Method Not Allowed for non-POST requests', async () => {
      const { status } = await request(questionsHandler).get('/');
      expect(status).toBe(405);
    });

    it('should return 400 Bad Request for malformed body', async () => {
      const { status } = await request(questionsHandler)
        .post('/')
        .send({});
      expect(status).toBe(400);
    });

    it('should return 200 and questions on success', async () => {
      const { status, body } = await request(questionsHandler)
        .post('/')
        .send({ ids: [1, 2, 3] });
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('id');
        expect(body[0]).toHaveProperty('question');
        expect(body[0]).toHaveProperty('options');
        expect(Array.isArray(body[0].options)).toBe(true);
      }
    });
  });
});
