import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/sync';

describe('/api/sync', () => {
  it('should return a 500 error when syncing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
