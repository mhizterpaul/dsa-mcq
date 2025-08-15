import NextAuth from 'next-auth';
import { Pool } from 'pg';
import { KyselyAuth } from '@auth/kysely-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Kysely, PostgresDialect } from 'kysely';
import bcrypt from 'bcryptjs';
import cache from '../../../services/cacheService';

interface Database {
  users: {
    id: string;
    name: string;
    email: string;
    emailVerified: Date | null;
    image: string | null;
    password?: string | null;
  };
  accounts: {
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
  };
  sessions: {
    id: string;
    sessionToken: string;
    userId: string;
    expires: Date;
  };
  verification_token: {
    identifier: string;
    token: string;
    expires: Date;
  };
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

export default NextAuth({
  adapter: KyselyAuth(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await db
          .selectFrom('users')
          .where('email', '=', credentials.email)
          .selectAll()
          .executeTakeFirst();

        if (user && user.password && (await bcrypt.compare(credentials.password, user.password))) {
          return { id: user.id, name: user.name, email: user.email, image: user.image };
        } else {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      cache.set(user.id, user);
    },
    async signOut({ token }) {
        if(token) {
            const userId = token.id as string;
            if(userId) {
             cache.delete(userId);
            }
        }
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
