import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import bcrypt from 'bcryptjs';

interface Database {
  users: {
    id: string;
    password?: string | null;
  };
  verification_token: {
    identifier: string;
    token: string;
    expires: Date;
  };
  // ... other tables
}

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      ssl: process.env.POSTGRES_SSL === 'true',
    }),
  }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }

  try {
    const verificationToken = await db
      .selectFrom('verification_token')
      .where('token', '=', token)
      .selectAll()
      .executeTakeFirst();

    if (!verificationToken || verificationToken.expires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db
      .updateTable('users')
      .set({ password: hashedPassword })
      .where('id', '=', verificationToken.identifier)
      .execute();

    await db
      .deleteFrom('verification_token')
      .where('token', '=', token)
      .execute();

    res.status(201).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
