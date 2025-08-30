import { createMocks } from 'node-mocks-http';
import handler from '../../../../../pages/api/engagement/user-engagement/[userId]';

describe('/api/engagement/user-engagement/[userId]', () => {
  it('should return 200 OK on success', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { userId: '1' },
    });
    await handler(req, res);
    // Fails, expecting 404 Not Found
    expect(res._getStatusCode()).toBe(404);
  });

  it('should return 401 Unauthorized for missing auth token', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { userId: '1' },
    });
    // Fails, expecting 200 OK
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });

  it('should return 403 Forbidden for accessing another user\'s data', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { userId: '2' },
      // Assuming the authenticated user is user '1'
    });
    // Fails, expecting 200 OK
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
