import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import bcrypt from 'bcryptjs';

interface Database {
  users: {
    id: string;
    name: string;
    email: string;
    emailVerified: Date | null;
    image: string | null;
    password?: string | null;
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
    return res.status(400).json({ message: 'Method Not Allowed' });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingUser = await db
      .selectFrom('users')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst();

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db
      .insertInto('users')
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning(['id', 'name', 'email', 'image'])
      .executeTakeFirst();

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
