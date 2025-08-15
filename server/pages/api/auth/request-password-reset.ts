import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

interface Database {
  users: {
    id: string;
    email: string;
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

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await db
      .selectFrom('users')
      .where('email', '=', email)
      .select('id')
      .executeTakeFirst();

    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await db
      .insertInto('verification_token')
      .values({
        identifier: user.id,
        token,
        expires,
      })
      .execute();

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // In a real app, you'd send an email
    console.log(`Password reset link for ${email}: ${resetLink}`);

    // Example of sending an email:
    // await transporter.sendMail({
    //   from: '"Your App" <noreply@yourapp.com>',
    //   to: email,
    //   subject: 'Password Reset',
    //   text: `Click here to reset your password: ${resetLink}`,
    //   html: `<a href="${resetLink}">Click here to reset your password</a>`,
    // });

    res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
