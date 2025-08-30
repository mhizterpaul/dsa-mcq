import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/learning/questions';

describe('/api/learning/questions', () => {
  it('should return a 500 error when fetching questions', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
