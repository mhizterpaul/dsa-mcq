import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import bcrypt from 'bcryptjs';
import { verifySignature } from '../../../utils/signature';
import jwt from 'jsonwebtoken';
import cache from '../../../services/cacheService';

interface Database {
  // ... (database interface)
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      // ... (db connection)
    }),
  }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifySignature(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    let user = cache.get(email) as any;

    if (!user) {
      user = await db
        .selectFrom('users')
        .where('email', '=', email)
        .selectAll()
        .executeTakeFirst();

      if (user) {
        cache.set(email, user);
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ user }, 'your-jwt-secret');
    const refreshToken = jwt.sign({ userId: user.id }, 'your-refresh-secret', { expiresIn: '7d' });

    res.status(200).json({ user, accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
