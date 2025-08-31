import request from 'supertest';
import devopsHandler from '../src/pages/api/analytics/devops';

// Mock the DB connection
jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('/api/analytics/devops', () => {
  it('should return 405 Method Not Allowed for non-GET/POST requests', async () => {
    const { status } = await request(devopsHandler).put('/');
    expect(status).toBe(405);
  });

  // DB-dependent tests are skipped for now
  // it('should return 200 OK on GET', async () => {
  //   const { status } = await request(devopsHandler).get('/');
  //   expect(status).toBe(200);
  // });

  // it('should return 201 Created on POST with valid data', async () => {
  //   const { status } = await request(devopsHandler)
  //     .post('/')
  //     .send({ type: 'CRASH', payload: { error: 'test' } });
  //   expect(status).toBe(201);
  // });
});
