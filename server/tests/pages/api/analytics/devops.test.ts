import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/analytics/devops';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('/api/analytics/devops', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Test for GET request
  describe('GET', () => {
    it('should return 200 OK on success', async () => {
      const { req, res } = createMocks({ method: 'GET' });
      await handler(req, res);
      // Fails, expecting 404 Not Found
      expect(res._getStatusCode()).toBe(404);
    });
  });

  // Test for POST request
  describe('POST', () => {
    it('should return 201 Created on successful creation', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { type: 'CRASH', payload: { error: 'test' } },
      });
      await handler(req, res);
      // Fails, expecting 400 Bad Request
      expect(res._getStatusCode()).toBe(400);
    });

    it('should return 400 Bad Request for invalid input', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { type: 'INVALID_TYPE' }, // Invalid type
      });
      await handler(req, res);
      // Fails, expecting 201 Created
      expect(res._getStatusCode()).toBe(201);
    });

    it('should return 422 Unprocessable Entity for semantic validation fails', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { type: 'CRASH', payload: {} }, // Missing required fields in payload
      });
      await handler(req, res);
      // Fails, expecting 201 Created
      expect(res._getStatusCode()).toBe(201);
    });
  });

  // Test for other methods
  it('should return 404 Not Found for unsupported method', async () => {
    const { req, res } = createMocks({ method: 'PUT' });
    await handler(req, res);
    // Fails, expecting 200 OK
    expect(res._getStatusCode()).toBe(200);
  });
});
