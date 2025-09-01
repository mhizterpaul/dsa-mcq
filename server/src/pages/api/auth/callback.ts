import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
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

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (typeof code !== 'string') {
    return res.status(400).json({ message: 'Invalid code' });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email) {
      return res.status(400).json({ message: 'Email not provided by OAuth provider' });
    }

    let user = await db
      .selectFrom('users')
      .where('email', '=', userInfo.email)
      .selectAll()
      .executeTakeFirst();

    if (!user) {
      user = await db
        .insertInto('users')
        .values({
          name: userInfo.name || '',
          email: userInfo.email,
          image: userInfo.picture || null,
          emailVerified: new Date(), // OAuth users are considered verified
        })
        .returning(['id', 'name', 'email', 'image'])
        .executeTakeFirst();
    }

    cache.set(user.id, user);

    const accessToken = jwt.sign({ user }, 'your-jwt-secret');
    const refreshToken = jwt.sign({ userId: user.id }, 'your-refresh-secret', { expiresIn: '7d' });

    // Redirect user to the frontend with tokens, or handle as needed
    res.status(200).json({ user, accessToken, refreshToken });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
