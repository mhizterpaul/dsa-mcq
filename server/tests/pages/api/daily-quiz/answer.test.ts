import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/daily-quiz/answer';

describe('/api/daily-quiz/answer', () => {
  it('should return a 500 error when submitting an answer', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        questionId: '1',
        answerId: '1',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
