import fetch from 'node-fetch';
import { startServer, stopServer } from './test-utils';

const API_URL = 'http://localhost:3000/api/analytics/devops';

describe('/api/analytics/devops', () => {
  beforeAll(async () => {
    await startServer();
  });

  afterAll(() => {
    stopServer();
  });

  it('should return 405 Method Not Allowed for non-GET/POST requests', async () => {
    const response = await fetch(API_URL, { method: 'PUT' });
    expect(response.status).toBe(405);
  });

  it('should return 200 OK on GET', async () => {
    const response = await fetch(API_URL);
    expect(response.status).toBe(200);
  });

  it('should return 201 Created on POST with valid data', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'CRASH', payload: { error: 'test' } }),
    });
    expect(response.status).toBe(201);
  });
});
