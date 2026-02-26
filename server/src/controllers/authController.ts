import { PrismaClient, User } from '@prisma/client';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async register(data: any) {
    const hashedPassword = await argon2.hash(data.password);
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        userAgent: data.userAgent || '',
        sessionToken: Math.random().toString(36).substring(7),
        expires: new Date(Date.now() + 3600000),
        syncKey: uuidv4(),
      },
    });

    const token = this.generateToken(user, session.id);
    return { user, token, syncKey: session.syncKey };
  }

  async login(email: string, password: string, userAgent: string = '') {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const passwordMatch = await argon2.verify(user.password, password);
    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        userAgent,
        sessionToken: Math.random().toString(36).substring(7),
        expires: new Date(Date.now() + 3600000),
        syncKey: uuidv4(),
      },
    });

    const token = this.generateToken(user, session.id);
    return { user, token, syncKey: session.syncKey };
  }

  async logout(sessionId: string) {
    await this.prisma.session.delete({ where: { id: sessionId } });
  }

  private generateToken(user: User, sessionId: string) {
    return jwt.sign(
      { user, sessionId },
      process.env.JWT_SECRET || 'your-jwt-secret',
      {
        expiresIn: '1h',
      }
    );
  }
}
