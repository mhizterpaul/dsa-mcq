import { createMocks } from 'node-mocks-http';
import registerHandler from '../src/pages/api/auth/register';
import resetPasswordHandler from '../src/pages/api/auth/reset-password';
import loginHandler from '../src/pages/api/auth/login';


eforeAll(() => {
  process.env.AUTH_PROVIDERS = JSON.stringify([
    Google({
      clientId: "google-id-123",
      clientSecret: "dummy-google-secret",
      authorization: {
        url: "https://oauth-mock.mock.beeceptor.com/oauth/authorize",
      },
      token: {
        url: "https://oauth-mock.mock.beeceptor.com/oauth/token/google",
      },
      userinfo: {
        url: "https://oauth-mock.mock.beeceptor.com/userinfo/google",
      },
    }),
  ]);
});
// Mock the mail service
jest.mock('../src/services/mailService', () => {
  return {
    sendEmail: jest.fn((to, subject, body) => {
      // Extract code from body and store it for test use
      const match = body.match(/code: (\w+)/);
      if (match) {
        (global as any).lastResetCode = match[1];
      }
      return Promise.resolve();
    }),
  };
});
describe('/api/auth', () => {
  describe('/register', () => {
    function makeReqRes(method: string, body: any = {}) {
      const { req, res } = createMocks({ method, body });
      return { req, res };
    }

    it('400 if email or password missing', async () => {
      let { req, res } = makeReqRes('POST', { email: 'user@example.com' });
      await registerHandler(req, res);
      expect(res._getStatusCode()).toBe(400);

      ({ req, res } = makeReqRes('POST', { password: 'pass123' }));
      await registerHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
    });

    it('400 if email malformed', async () => {
      const { req, res } = makeReqRes('POST', {
        email: 'not-an-email',
        password: 'ValidPass123!',
      });
      await registerHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toContain('Invalid email');
    });

    it('201 and proper payload on valid input', async () => {
      const { req, res } = makeReqRes('POST', {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
      });
      await registerHandler(req, res);
      expect(res._getStatusCode()).toBe(201);

      const data = JSON.parse(res._getData());
      expect(data).toMatchObject({
        userId: expect.any(String),
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          email: 'newuser@example.com',
          profilePicUrl: expect.any(String),
        },
      });
    });

    it('409 if user already registered', async () => {
      const { req, res } = makeReqRes('POST', {
        email: 'existing@example.com',
        password: 'AnotherPass123!',
      });
      await registerHandler(req, res);
      expect(res._getStatusCode()).toBe(409);
      expect(res._getData()).toContain('User already exists');
    });

    it('authenticates users using OAuth', async () => {
    // Step 1: Request access token from Beeceptor token endpoint
    const tokenResponse = await fetch(
      'https://oauth-mock.mock.beeceptor.com/oauth/token/google',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          password: 'testpass',
          grant_type: 'password',
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Step 2: Send token to registerHandler as frontend would
    const { req, res } = makeReqRes('POST', {
      oauthProvider: 'google',
      oauthToken: accessToken,
    });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(201);

    const data = JSON.parse(res._getData());
    expect(res._getStatusCode()).toBe(401); 
expect(res._getData()).toContain('Invalid token');  });
    });
describe('/api/auth/login', () => {
  function makeReqRes(method: string, body: any = {}) {
    return createMocks({ method, body });
  }

  it('returns 400 if email or password is missing', async () => {
    let { req, res } = makeReqRes('POST', { email: 'user@example.com' });
    await loginHandler(req, res);
    expect(res._getStatusCode()).toBe(400);

    ({ req, res } = makeReqRes('POST', { password: 'pass123' }));
    await loginHandler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 401 if credentials are invalid', async () => {
    const { req, res } = makeReqRes('POST', {
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    });

    await loginHandler(req, res);
    expect(res._getStatusCode()).toBe(401);
    expect(res._getData()).toContain('Invalid credentials');
  });

  it('returns 200 and payload on successful login', async () => {
    const { req, res } = makeReqRes('POST', {
      email: 'existinguser@example.com',
      password: 'CorrectPass123!',
    });

    await loginHandler(req, res);
    expect(res._getStatusCode()).toBe(200);

    const data = JSON.parse(res._getData());
    expect(data).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        email: 'existinguser@example.com',
        name: expect.any(String),
        image: expect.any(String),
      },
    });
  });
})
 

describe('/reset-password', () => { 
  function makeReqRes(method: string, url = '', body: any = {}) {
    return createMocks({ method, url, body });
  }

  it('registers a user, resets password, and logs in with new password', async () => {
    const email = 'resetuser@example.com';
    const oldPassword = 'OldPass123!';
    const newPassword = 'NewPass456!';

    // Step 1: Register user
    let { req, res } = makeReqRes('POST', '', { email, password: oldPassword });
    await registerHandler(req, res);
    expect(res._getStatusCode()).toBe(201);
    const userId = JSON.parse(res._getData()).userId;

    // Step 2: Request password reset (sends email via mocked service)
    ({ req, res } = makeReqRes('POST', '', { email }));
    await resetPasswordHandler(req, res);
    expect(res._getStatusCode()).toBe(201);

    // Step 3: Retrieve reset code from mocked mail service
    const resetCode = (global as any).lastResetCode;
    expect(resetCode).toBeDefined();

    // Step 4: Submit new password with reset code
    ({ req, res } = makeReqRes('POST', `/reset-password?userId=${userId}`, { newPassword, resetCode }));
    await resetPasswordHandler(req, res);
    expect(res._getStatusCode()).toBe(200);

    // Step 5: Login with new password
    ({ req, res } = makeReqRes('POST', '', { email, password: newPassword }));
    await loginHandler(req, res);
    expect(res._getStatusCode()).toBe(200);

    const loginData = JSON.parse(res._getData());
    expect(loginData).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        email,
        name: expect.any(String),
        image: expect.any(String),
      },
    });
  });
}); 
});
