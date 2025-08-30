import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/engagement/weekly-king';

describe('/api/engagement/weekly-king', () => {
  it('should return a 500 error when fetching the weekly king', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
