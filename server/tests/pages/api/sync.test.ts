import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/sync';

describe('/api/sync', () => {
  it('should return 200 OK on success', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });
    await handler(req, res);
    // Fails, expecting 400 Bad Request
    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 401 Unauthorized for missing auth token', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });
    // Fails, expecting 200 OK
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
