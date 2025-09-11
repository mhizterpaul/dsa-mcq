import { PrismaClient, User } from '@prisma/client';
import { CacheService } from './cacheService';
import { NextApiResponse } from 'next';

// The sseConnections map stores active server-sent event connections for real-time updates.
// This is kept in-memory as it relates to transient connections, not persistent state.
const sseConnections = new Map<string, Map<string, NextApiResponse>>();

export class QuizService {
  private prisma: PrismaClient;
  private cache: CacheService;

  constructor(prisma: PrismaClient, cache: CacheService) {
    this.prisma = prisma;
    this.cache = cache;
  }

  async getOrCreateDailyQuizSession() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let session = await this.prisma.quizSession.findUnique({
      where: { date: today },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!session) {
      session = await this.prisma.quizSession.create({
        data: {
          date: today,
          startTime: new Date(),
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
        },
      });
    }

    return session;
  }

  async findOrCreateParticipant(session: any, user: User) {
    const existingParticipant = session.participants.find((p: any) => p.userId === user.id);

    if (!existingParticipant) {
      const newParticipant = await this.prisma.quizParticipant.create({
        data: {
          userId: user.id,
          sessionId: session.id,
        },
        include: {
          user: true,
        },
      });
      this.broadcast(session.id, { type: 'participant-joined', participant: newParticipant });
      return newParticipant;
    }

    return existingParticipant;
  }

  async handleAnswer(userId: string, questionId: string, answer: string) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw new Error('Question not found');

    const session = await this.getOrCreateDailyQuizSession();
    // This is not ideal, but we need the user object to find the participant.
    // In a real app, we might pass the full user object down from the handler.
    const user = await this.prisma.user.findUnique({ where: { id: userId }});
    if (!user) throw new Error('User not found');

    const participant = await this.findOrCreateParticipant(session, user);

    const isCorrect = question.correctAnswer === answer;

    let updatedParticipant;

    if (isCorrect) {
      updatedParticipant = await this.prisma.quizParticipant.update({
        where: { id: participant.id },
        data: {
          score: { increment: 10 },
          streak: { increment: 1 },
        },
      });
    } else {
      updatedParticipant = await this.prisma.quizParticipant.update({
        where: { id: participant.id },
        data: { streak: 0 },
      });
    }

    const result = { isCorrect, score: updatedParticipant.score, streak: updatedParticipant.streak };
    this.broadcast(session.id, { type: 'answer-result', userId, result });
    return result;
  }

  addSseConnection(sessionId: string, userId: string, res: NextApiResponse) {
    if (!sseConnections.has(sessionId)) {
      sseConnections.set(sessionId, new Map());
    }
    sseConnections.get(sessionId)!.set(userId, res);
  }

  removeSseConnection(sessionId: string, userId: string) {
    if (sseConnections.has(sessionId)) {
      sseConnections.get(sessionId)!.delete(userId);
      if (sseConnections.get(sessionId)!.size === 0) {
        sseConnections.delete(sessionId);
      }
    }
  }

  async removeParticipant(sessionId: string, userId: string) {
    await this.prisma.quizParticipant.deleteMany({
      where: {
        sessionId,
        userId,
      },
    });
    this.broadcast(sessionId, { type: 'participant-left', userId });
  }

  broadcast(sessionId: string, data: any) {
    const sessionConnections = sseConnections.get(sessionId);
    if (sessionConnections) {
      for (const res of sessionConnections.values()) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    }
  }
}
