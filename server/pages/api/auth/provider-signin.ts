import type { NextApiRequest, NextApiResponse } from 'next';

// This interface defines the shape of the successful response.
// It can be shared between the client and server.
export interface AuthResponse {
  token: string; // Our app's session token (e.g., a JWT)
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

// This is a mock user database for demonstration purposes.
const users = [
    { id: '1', name: 'Test User', email: 'test@example.com', image: '' }
];

// This function simulates verifying a token with an OAuth provider.
const verifyToken = async (provider: string, token: string): Promise<any> => {
  console.log(`Verifying token for provider: ${provider}`);
  // In a real app, you would use a library like 'google-auth-library'
  // to verify the token against the provider's servers.
  // For now, we'll just simulate a successful verification.
  if (token === 'valid-token') {
    return {
      email: 'test@example.com',
      name: 'Test User',
      picture: ''
    };
  }
  throw new Error('Invalid token');
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { provider, token } = req.body;

  if (!provider || !token) {
    return res.status(400).json({ error: 'Provider and token are required' });
  }

  try {
    // 1. Verify the token with the OAuth provider (mocked)
    const profile = await verifyToken(provider, token);

    // 2. Find or create a user in our database (mocked)
    let user = users.find(u => u.email === profile.email);
    if (!user) {
      // Create a new user if they don't exist
      user = {
        id: String(users.length + 1),
        name: profile.name,
        email: profile.email,
        image: profile.picture
      };
      users.push(user);
    }

    // 3. Generate a session token for our app (e.g., a JWT - mocked)
    const sessionToken = `mock-session-token-for-${user.id}-${Date.now()}`;

    // 4. Return the session token and user data
    const response: AuthResponse = {
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image
      },
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}
